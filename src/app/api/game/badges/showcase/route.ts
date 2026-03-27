import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function PUT(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const body = await request.json().catch(() => null);

    if (!body || !Array.isArray(body.badgeIds)) {
      return errorResponse('badgeIds array is required', 400);
    }

    const badgeIds: string[] = body.badgeIds;

    if (badgeIds.length > 5) {
      return errorResponse('Maximum 5 showcased badges allowed', 400);
    }

    // Verify user owns all the badges
    const owned = await prisma.userBadge.findMany({
      where: { userId: auth.user.id, badgeId: { in: badgeIds } },
    });

    if (owned.length !== badgeIds.length) {
      return errorResponse('Some badges are not earned', 400);
    }

    // Reset all showcase flags
    await prisma.userBadge.updateMany({
      where: { userId: auth.user.id },
      data: { isShowcased: false },
    });

    // Set new showcase badges
    if (badgeIds.length > 0) {
      await prisma.userBadge.updateMany({
        where: { userId: auth.user.id, badgeId: { in: badgeIds } },
        data: { isShowcased: true },
      });
    }

    return jsonResponse({ success: true, showcased: badgeIds.length });
  } catch (error) {
    console.error('Error updating badge showcase:', error);
    return errorResponse('Failed to update badge showcase', 500);
  }
}
