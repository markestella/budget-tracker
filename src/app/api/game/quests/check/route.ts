import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkQuestProgress } from '@/lib/game/quests/questProgressChecker';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function POST() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const result = await checkQuestProgress(auth.user.id);
    return jsonResponse(result);
  } catch (error) {
    console.error('Error checking quest progress:', error);
    return errorResponse('Failed to check quest progress', 500);
  }
}
