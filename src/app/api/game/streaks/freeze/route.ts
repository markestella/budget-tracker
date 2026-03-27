import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { useStreakFreeze } from '@/lib/game/streaks';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function POST() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const result = await useStreakFreeze(auth.user.id);

    if (!result.success) {
      return errorResponse('No streak freezes remaining this week', 400);
    }

    return jsonResponse(result);
  } catch (error) {
    console.error('Error using streak freeze:', error);
    return errorResponse('Failed to use streak freeze', 500);
  }
}
