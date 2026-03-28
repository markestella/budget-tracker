import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { joinGuildSchema } from '@/lib/validations/social';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId } = await params;

  const body = await req.json();
  const validation = validateRequest(joinGuildSchema, body);
  if ('error' in validation) return validation.error;

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: { _count: { select: { members: true } } },
  });

  if (!guild) {
    return errorResponse('Guild not found', 404);
  }

  // For private guilds, require invite code
  if (!guild.isPublic) {
    if (!validation.data.inviteCode || validation.data.inviteCode !== guild.inviteCode) {
      return errorResponse('Invalid invite code', 403);
    }
  }

  if (guild._count.members >= guild.maxMembers) {
    return errorResponse('Guild is full', 400);
  }

  // Check if already a member
  const existing = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
  if (existing) {
    return errorResponse('Already a member', 409);
  }

  const member = await prisma.guildMember.create({
    data: { guildId, userId, role: 'MEMBER' },
  });

  return jsonResponse(member, { status: 201 });
}
