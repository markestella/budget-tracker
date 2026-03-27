import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { getStreakInfo } from '@/lib/game/streaks';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const streakInfo = await getStreakInfo(auth.user.id);
    return jsonResponse(streakInfo);
  } catch (error) {
    console.error('Error fetching streak info:', error);
    return errorResponse('Failed to fetch streak info', 500);
  }
}
