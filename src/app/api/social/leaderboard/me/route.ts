import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;

  // Check if user has opted in
  const optIn = await prisma.leaderboardOptIn.findUnique({
    where: { userId },
  });

  if (!optIn?.isOptedIn) {
    return errorResponse('Not opted in to leaderboard', 403);
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'XP';
  const period = url.searchParams.get('period') ?? 'WEEKLY';

  // Get the user's score based on type
  const gameProfile = await prisma.gameProfile.findUnique({
    where: { userId },
  });

  if (!gameProfile) {
    return errorResponse('Game profile not found', 404);
  }

  let userScore: number;

  if (type === 'XP' && period !== 'ALL_TIME') {
    const days = period === 'WEEKLY' ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await prisma.xPTransaction.aggregate({
      where: { userId, createdAt: { gte: since } },
      _sum: { amount: true },
    });
    userScore = result._sum.amount ?? 0;
  } else if (type === 'STREAK') {
    userScore = gameProfile.currentStreak;
  } else if (type === 'HEALTH_SCORE') {
    userScore = gameProfile.financialHealthScore;
  } else if (type === 'CHALLENGES') {
    userScore = await prisma.userChallengeProgress.count({
      where: { userId, status: 'COMPLETED' },
    });
  } else {
    userScore = gameProfile.xp;
  }

  // Count users with higher score to determine rank
  let rank: number;

  if (type === 'XP' && period !== 'ALL_TIME') {
    const days = period === 'WEEKLY' ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const higherResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM (
        SELECT xt."userId", SUM(xt.amount) as total
        FROM xp_transactions xt
        JOIN leaderboard_opt_ins lo ON lo."userId" = xt."userId" AND lo."isOptedIn" = true
        WHERE xt."createdAt" >= ${since}
        GROUP BY xt."userId"
        HAVING SUM(xt.amount) > ${userScore}
      ) sub
    `;
    rank = Number(higherResult[0]?.count ?? 0) + 1;
  } else if (type === 'CHALLENGES') {
    const higherResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM (
        SELECT ucp."userId", COUNT(*) as total
        FROM user_challenge_progress ucp
        JOIN leaderboard_opt_ins lo ON lo."userId" = ucp."userId" AND lo."isOptedIn" = true
        WHERE ucp.status = 'COMPLETED'
        GROUP BY ucp."userId"
        HAVING COUNT(*) > ${userScore}
      ) sub
    `;
    rank = Number(higherResult[0]?.count ?? 0) + 1;
  } else {
    const orderField = type === 'STREAK' ? 'currentStreak' : type === 'HEALTH_SCORE' ? 'financialHealthScore' : 'xp';
    const higherCount = await prisma.gameProfile.count({
      where: {
        [orderField]: { gt: userScore },
        user: { leaderboardOptIn: { isOptedIn: true } },
      },
    });
    rank = higherCount + 1;
  }

  const totalParticipants = await prisma.leaderboardOptIn.count({
    where: { isOptedIn: true },
  });

  return jsonResponse({
    rank,
    score: userScore,
    displayName: optIn.displayName,
    level: gameProfile.level,
    totalParticipants,
  });
}
