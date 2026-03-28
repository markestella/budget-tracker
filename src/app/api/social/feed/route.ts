import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';

const PAGE_SIZE = 15;
const FEED_CACHE_TTL = 60; // 1 minute

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));

  const cacheKey = `social:feed:page:${page}`;
  const cached = await getCache<{ events: unknown[]; totalEvents: number; page: number; totalPages: number }>(cacheKey);

  let events;
  let totalEvents: number;

  if (cached) {
    events = cached.events;
    totalEvents = cached.totalEvents;
  } else {
    const offset = (page - 1) * PAGE_SIZE;

    const [rawEvents, total] = await Promise.all([
      prisma.achievementEvent.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: { id: true, name: true },
          },
          reactions: {
            select: { emoji: true, userId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: PAGE_SIZE,
      }),
      prisma.achievementEvent.count({ where: { isPublic: true } }),
    ]);

    events = rawEvents.map((e) => {
      // Count reactions by emoji
      const reactionCounts: Record<string, number> = {};
      let userReaction: string | null = null;

      for (const r of e.reactions) {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
        if (r.userId === userId) {
          userReaction = r.emoji;
        }
      }

      return {
        id: e.id,
        userId: e.userId,
        userName: e.user.name,
        eventType: e.eventType,
        displayText: e.displayText,
        createdAt: e.createdAt,
        reactions: reactionCounts,
        totalReactions: e.reactions.length,
        userReaction,
      };
    });

    totalEvents = total;

    await setCache(cacheKey, {
      events,
      totalEvents,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    }, FEED_CACHE_TTL);
  }

  return jsonResponse({
    events,
    totalEvents,
    page,
    totalPages: Math.ceil(totalEvents / PAGE_SIZE),
  });
}
