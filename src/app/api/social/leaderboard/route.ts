import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';

const PAGE_SIZE = 20;
const CACHE_TTL = 300; // 5 minutes

type LeaderboardType = 'XP' | 'STREAK' | 'HEALTH_SCORE' | 'CHALLENGES';
type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarEmoji: string;
  level: number;
  score: number;
  medalEmoji: string | null;
}

function getMedalEmoji(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

async function computeRankings(
  type: LeaderboardType,
  period: LeaderboardPeriod,
  page: number,
) {
  const offset = (page - 1) * PAGE_SIZE;

  if (type === 'XP' && period !== 'ALL_TIME') {
    // For weekly/monthly XP, sum recent XPTransactions
    const days = period === 'WEEKLY' ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries = await prisma.$queryRaw<
      { userId: string; displayName: string; level: number; score: bigint }[]
    >`
      SELECT 
        xt."userId",
        COALESCE(lo."displayName", 'Anonymous') as "displayName",
        COALESCE(gp.level, 1) as level,
        SUM(xt.amount) as score
      FROM xp_transactions xt
      JOIN leaderboard_opt_ins lo ON lo."userId" = xt."userId" AND lo."isOptedIn" = true
      LEFT JOIN game_profiles gp ON gp."userId" = xt."userId"
      WHERE xt."createdAt" >= ${since}
      GROUP BY xt."userId", lo."displayName", gp.level
      ORDER BY score DESC
      LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
    `;

    const totalResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT xt."userId") as count
      FROM xp_transactions xt
      JOIN leaderboard_opt_ins lo ON lo."userId" = xt."userId" AND lo."isOptedIn" = true
      WHERE xt."createdAt" >= ${since}
    `;
    const totalEntries = Number(totalResult[0]?.count ?? 0);

    return {
      entries: entries.slice(0, PAGE_SIZE).map((e, i) => ({
        rank: offset + i + 1,
        userId: e.userId,
        displayName: e.displayName,
        avatarEmoji: '😊',
        level: e.level,
        score: Number(e.score),
        medalEmoji: getMedalEmoji(offset + i + 1),
      })),
      totalEntries,
      page,
      totalPages: Math.ceil(totalEntries / PAGE_SIZE),
    };
  }

  // All-time queries using GameProfile fields
  const orderField = {
    XP: 'xp',
    STREAK: 'currentStreak',
    HEALTH_SCORE: 'financialHealthScore',
    CHALLENGES: 'xp', // fallback — will be overridden below
  }[type];

  if (type === 'CHALLENGES') {
    // Rank by completed community challenges count
    const entries = await prisma.$queryRaw<
      { userId: string; displayName: string; level: number; score: bigint }[]
    >`
      SELECT
        ucp."userId",
        COALESCE(lo."displayName", 'Anonymous') as "displayName",
        COALESCE(gp.level, 1) as level,
        COUNT(*) as score
      FROM user_challenge_progress ucp
      JOIN leaderboard_opt_ins lo ON lo."userId" = ucp."userId" AND lo."isOptedIn" = true
      LEFT JOIN game_profiles gp ON gp."userId" = ucp."userId"
      WHERE ucp.status = 'COMPLETED'
      GROUP BY ucp."userId", lo."displayName", gp.level
      ORDER BY score DESC
      LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
    `;

    const totalResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT ucp."userId") as count
      FROM user_challenge_progress ucp
      JOIN leaderboard_opt_ins lo ON lo."userId" = ucp."userId" AND lo."isOptedIn" = true
      WHERE ucp.status = 'COMPLETED'
    `;
    const totalEntries = Number(totalResult[0]?.count ?? 0);

    return {
      entries: entries.slice(0, PAGE_SIZE).map((e, i) => ({
        rank: offset + i + 1,
        userId: e.userId,
        displayName: e.displayName,
        avatarEmoji: '😊',
        level: e.level,
        score: Number(e.score),
        medalEmoji: getMedalEmoji(offset + i + 1),
      })),
      totalEntries,
      page,
      totalPages: Math.ceil(totalEntries / PAGE_SIZE),
    };
  }

  // XP (all-time), STREAK, HEALTH_SCORE from GameProfile
  const users = await prisma.gameProfile.findMany({
    where: {
      user: {
        leaderboardOptIn: { isOptedIn: true },
      },
    },
    include: {
      user: {
        include: {
          leaderboardOptIn: { select: { displayName: true } },
        },
      },
    },
    orderBy: { [orderField]: 'desc' },
    skip: offset,
    take: PAGE_SIZE,
  });

  const totalEntries = await prisma.gameProfile.count({
    where: {
      user: {
        leaderboardOptIn: { isOptedIn: true },
      },
    },
  });

  const entries: LeaderboardEntry[] = users.map((gp, i) => ({
    rank: offset + i + 1,
    userId: gp.userId,
    displayName: gp.user.leaderboardOptIn?.displayName ?? 'Anonymous',
    avatarEmoji: '😊',
    level: gp.level,
    score: type === 'STREAK' ? gp.currentStreak : type === 'HEALTH_SCORE' ? gp.financialHealthScore : gp.xp,
    medalEmoji: getMedalEmoji(offset + i + 1),
  }));

  return {
    entries,
    totalEntries,
    page,
    totalPages: Math.ceil(totalEntries / PAGE_SIZE),
  };
}

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const type = (url.searchParams.get('type') ?? 'XP') as LeaderboardType;
  const period = (url.searchParams.get('period') ?? 'WEEKLY') as LeaderboardPeriod;
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));

  const validTypes = ['XP', 'STREAK', 'HEALTH_SCORE', 'CHALLENGES'];
  const validPeriods = ['WEEKLY', 'MONTHLY', 'ALL_TIME'];
  if (!validTypes.includes(type) || !validPeriods.includes(period)) {
    return jsonResponse({ entries: [], totalEntries: 0, page: 1, totalPages: 0 });
  }

  const cacheKey = `lb:${type}:${period}:page:${page}`;
  const cached = await getCache<ReturnType<typeof computeRankings>>(cacheKey);
  if (cached) return jsonResponse(cached);

  const data = await computeRankings(type, period, page);
  await setCache(cacheKey, data, CACHE_TTL);

  return jsonResponse(data);
}
