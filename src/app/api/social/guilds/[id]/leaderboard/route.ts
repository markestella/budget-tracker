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
  const { id: guildId } = await params;

  const membership = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (!membership) {
    return errorResponse('Not a member of this guild', 403);
  }

  const members = await prisma.guildMember.findMany({
    where: { guildId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          gameProfile: {
            select: { xp: true, level: true },
          },
        },
      },
    },
  });

  const ranked = members
    .map((m) => ({
      userId: m.userId,
      name: m.user.name,
      role: m.role,
      xp: m.user.gameProfile?.xp ?? 0,
      level: m.user.gameProfile?.level ?? 1,
    }))
    .sort((a, b) => b.xp - a.xp)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  return jsonResponse(ranked);
}
