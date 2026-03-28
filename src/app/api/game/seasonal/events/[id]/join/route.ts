import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const { id: eventId } = await params;

    const event = await prisma.seasonalEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return errorResponse('Seasonal event not found', 404);
    }

    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      return errorResponse('This seasonal event is not currently active', 400);
    }

    const participation = await prisma.userSeasonalProgress.upsert({
      where: {
        userId_seasonalEventId: {
          userId: auth.user.id,
          seasonalEventId: eventId,
        },
      },
      create: {
        userId: auth.user.id,
        seasonalEventId: eventId,
        progress: 0,
        milestonesReached: [],
      },
      update: {},
    });

    return jsonResponse({ joined: true, participation });
  } catch (error) {
    console.error('Error joining seasonal event:', error);
    return errorResponse('Failed to join seasonal event', 500);
  }
}
