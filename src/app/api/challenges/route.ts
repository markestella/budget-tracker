import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;

  const challenges = await prisma.challengeDefinition.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  // Get user progress for each challenge
  const progressRecords = await prisma.userChallengeProgress.findMany({
    where: {
      userId,
      challengeDefinitionId: { in: challenges.map((c) => c.id) },
    },
  });

  const progressMap = new Map(
    progressRecords.map((p) => [p.challengeDefinitionId, p]),
  );

  // Get participant counts
  const participantCounts = await prisma.userChallengeProgress.groupBy({
    by: ['challengeDefinitionId'],
    where: {
      challengeDefinitionId: { in: challenges.map((c) => c.id) },
    },
    _count: true,
  });

  const countMap = new Map(
    participantCounts.map((p) => [p.challengeDefinitionId, p._count]),
  );

  const result = challenges.map((c) => {
    const userProgress = progressMap.get(c.id);
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      month: c.month,
      xpReward: c.xpReward,
      exclusiveBadgeKey: c.exclusiveBadgeKey,
      completionCriteria: c.completionCriteria,
      participantCount: countMap.get(c.id) ?? 0,
      userProgress: userProgress
        ? {
            progress: userProgress.progress,
            status: userProgress.status,
            completedAt: userProgress.completedAt,
          }
        : null,
    };
  });

  return jsonResponse(result);
}
