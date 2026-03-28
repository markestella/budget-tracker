import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: challengeId } = await params;

  const challenge = await prisma.challengeDefinition.findUnique({
    where: { id: challengeId },
  });

  if (!challenge || !challenge.isActive) {
    return errorResponse('Challenge not found or inactive', 404);
  }

  // Check if already joined
  const existing = await prisma.userChallengeProgress.findUnique({
    where: {
      userId_challengeDefinitionId: { userId, challengeDefinitionId: challengeId },
    },
  });

  if (existing) {
    return errorResponse('Already joined this challenge', 409);
  }

  const progress = await prisma.userChallengeProgress.create({
    data: {
      userId,
      challengeDefinitionId: challengeId,
      status: 'IN_PROGRESS',
    },
  });

  return jsonResponse(progress, { status: 201 });
}
