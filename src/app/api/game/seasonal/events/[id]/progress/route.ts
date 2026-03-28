import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET(
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

    const participation = await prisma.userSeasonalProgress.findUnique({
      where: {
        userId_seasonalEventId: {
          userId: auth.user.id,
          seasonalEventId: eventId,
        },
      },
    });

    if (!participation) {
      return jsonResponse({
        joined: false,
        progress: 0,
        milestonesReached: [],
        milestones: event.milestones,
      });
    }

    return jsonResponse({
      joined: true,
      progress: participation.progress,
      milestonesReached: participation.milestonesReached,
      milestones: event.milestones,
      joinedAt: participation.joinedAt,
    });
  } catch (error) {
    console.error('Error fetching seasonal progress:', error);
    return errorResponse('Failed to fetch seasonal event progress', 500);
  }
}
