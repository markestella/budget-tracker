import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function GET(
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

  if (!challenge) {
    return errorResponse('Challenge not found', 404);
  }

  const [userProgress, participantCount, recentCompletions] = await Promise.all([
    prisma.userChallengeProgress.findUnique({
      where: {
        userId_challengeDefinitionId: { userId, challengeDefinitionId: challengeId },
      },
    }),
    prisma.userChallengeProgress.count({
      where: { challengeDefinitionId: challengeId },
    }),
    prisma.userChallengeProgress.findMany({
      where: {
        challengeDefinitionId: challengeId,
        status: 'COMPLETED',
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
  ]);

  return jsonResponse({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    type: challenge.type,
    month: challenge.month,
    xpReward: challenge.xpReward,
    exclusiveBadgeKey: challenge.exclusiveBadgeKey,
    completionCriteria: challenge.completionCriteria,
    participantCount,
    userProgress: userProgress
      ? {
          progress: userProgress.progress,
          status: userProgress.status,
          completedAt: userProgress.completedAt,
        }
      : null,
    recentCompletions: recentCompletions.map((rc) => ({
      userName: rc.user.name,
      completedAt: rc.completedAt,
    })),
  });
}
