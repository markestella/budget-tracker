import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { challengeTrackSchema } from '@/lib/validations/challenges';
import { awardXP } from '@/lib/game/xpService';
import { createAchievementEvent } from '@/lib/social/achievementEvents';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: challengeId } = await params;

  const body = await req.json();
  const validation = validateRequest(challengeTrackSchema, body);
  if ('error' in validation) return validation.error;

  const userProgress = await prisma.userChallengeProgress.findUnique({
    where: {
      userId_challengeDefinitionId: { userId, challengeDefinitionId: challengeId },
    },
  });

  if (!userProgress) {
    return errorResponse('Not joined this challenge. Join first.', 404);
  }

  if (userProgress.status === 'COMPLETED') {
    return errorResponse('Challenge already completed', 400);
  }

  const newProgress = validation.data.progress;
  const isCompleted = newProgress >= 100;

  const updated = await prisma.userChallengeProgress.update({
    where: { id: userProgress.id },
    data: {
      progress: Math.min(newProgress, 100),
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      completedAt: isCompleted ? new Date() : null,
    },
  });

  if (isCompleted) {
    // Award challenge XP
    const challenge = await prisma.challengeDefinition.findUnique({
      where: { id: challengeId },
    });

    if (challenge) {
      await awardXP(userId, 'COMPLETE_COMMUNITY_CHALLENGE', challenge.xpReward);
      await createAchievementEvent({
        userId,
        eventType: 'CHALLENGE_COMPLETED',
        displayText: `Completed the "${challenge.title}" challenge!`,
        metadata: { challengeId, challengeTitle: challenge.title, xpEarned: challenge.xpReward },
      });
    }
  }

  return jsonResponse(updated);
}
