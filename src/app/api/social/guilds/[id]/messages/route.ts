import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { guildMessageSchema } from '@/lib/validations/social';

async function requireMember(guildId: string, userId: string) {
  return prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
}

// GET — last 50 messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId } = await params;

  const membership = await requireMember(guildId, userId);
  if (!membership) {
    return errorResponse('Not a member of this guild', 403);
  }

  const messages = await prisma.guildMessage.findMany({
    where: { guildId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return jsonResponse(
    messages.reverse().map((msg) => ({
      id: msg.id,
      userId: msg.userId,
      userName: msg.user.name,
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  );
}

// POST — send message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId } = await params;

  const membership = await requireMember(guildId, userId);
  if (!membership) {
    return errorResponse('Not a member of this guild', 403);
  }

  const body = await req.json();
  const validation = validateRequest(guildMessageSchema, body);
  if ('error' in validation) return validation.error;

  const message = await prisma.guildMessage.create({
    data: {
      guildId,
      userId,
      content: validation.data.content,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return jsonResponse(
    {
      id: message.id,
      userId: message.userId,
      userName: message.user.name,
      content: message.content,
      createdAt: message.createdAt,
    },
    { status: 201 },
  );
}
