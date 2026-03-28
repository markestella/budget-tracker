import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const search = url.searchParams.get('search') ?? '';

  const where = {
    isPublic: true,
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [guilds, total] = await Promise.all([
    prisma.guild.findMany({
      where,
      include: {
        _count: { select: { members: true } },
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.guild.count({ where }),
  ]);

  const results = guilds.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    memberCount: g._count.members,
    maxMembers: g.maxMembers,
    isMember: g.members.length > 0,
    createdAt: g.createdAt,
  }));

  return jsonResponse({
    guilds: results,
    totalGuilds: total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
