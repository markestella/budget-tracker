import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { BADGE_DEFINITIONS } from '@/lib/game/badges/badgeDefinitions';

async function ensureBadgesSeeded() {
  const count = await prisma.badge.count();
  if (count > 0) return;

  await prisma.badge.createMany({
    data: BADGE_DEFINITIONS.map((b) => ({
      key: b.key,
      name: b.name,
      description: b.description,
      icon: b.icon,
      category: b.category,
      tier: b.tier,
      xpReward: b.xpReward,
    })),
    skipDuplicates: true,
  });
}

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    await ensureBadgesSeeded();

    const [allBadges, userBadges] = await Promise.all([
      prisma.badge.findMany({ orderBy: { category: 'asc' } }),
      prisma.userBadge.findMany({ where: { userId: auth.user.id } }),
    ]);

    const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

    const badges = allBadges.map((badge) => {
      const earned = earnedMap.get(badge.id);
      return {
        ...badge,
        earned: !!earned,
        earnedAt: earned?.earnedAt ?? null,
        isShowcased: earned?.isShowcased ?? false,
      };
    });

    return jsonResponse(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return errorResponse('Failed to fetch badges', 500);
  }
}
