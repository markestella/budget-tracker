import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createGuildChallengeSchema } from '@/lib/validations/social';

// GET — list guild challenges
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId } = await params;

  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
  if (!membership) {
    return errorResponse('Not a member of this guild', 403);
  }

  const challenges = await prisma.guildChallenge.findMany({
    where: { guildId },
    orderBy: { startDate: 'desc' },
  });

  return jsonResponse(challenges);
}

// POST — create guild challenge (OWNER/ADMIN only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: guildId } = await params;

  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    return errorResponse('Requires OWNER or ADMIN role', 403);
  }

  // Limit active challenges per guild
  const activeCount = await prisma.guildChallenge.count({
    where: { guildId, status: 'ACTIVE' },
  });
  if (activeCount >= 3) {
    return errorResponse('Maximum 3 active challenges per guild', 400);
  }

  const body = await req.json();
  const validation = validateRequest(createGuildChallengeSchema, body);
  if ('error' in validation) return validation.error;

  const { title, description, targetType, targetValue, startDate, endDate, xpReward } = validation.data;

  const challenge = await prisma.guildChallenge.create({
    data: {
      guildId,
      title,
      description: description ?? null,
      targetType,
      targetValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      xpReward,
    },
  });

  return jsonResponse(challenge, { status: 201 });
}
