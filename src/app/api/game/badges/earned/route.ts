import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: auth.user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    return jsonResponse(userBadges);
  } catch (error) {
    console.error('Error fetching earned badges:', error);
    return errorResponse('Failed to fetch earned badges', 500);
  }
}
