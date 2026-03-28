import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const entries = await prisma.$queryRaw<
    { userId: string; name: string; completed: bigint }[]
  >`
    SELECT 
      u.id as "userId",
      COALESCE(u.name, 'Anonymous') as name,
      COUNT(*) as completed
    FROM user_challenge_progress ucp
    JOIN users u ON u.id = ucp."userId"
    WHERE ucp.status = 'COMPLETED'
    GROUP BY u.id, u.name
    ORDER BY completed DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `;

  const totalResult = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT "userId") as count
    FROM user_challenge_progress
    WHERE status = 'COMPLETED'
  `;
  const totalEntries = Number(totalResult[0]?.count ?? 0);

  const ranked = entries.map((e, i) => ({
    rank: offset + i + 1,
    userId: e.userId,
    name: e.name,
    completedChallenges: Number(e.completed),
  }));

  return jsonResponse({
    entries: ranked,
    totalEntries,
    page,
    totalPages: Math.ceil(totalEntries / PAGE_SIZE),
  });
}
