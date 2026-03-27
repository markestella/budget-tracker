import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { calculateHealthScore, getHealthScoreHistory } from '@/lib/game/healthScore';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const [score, history] = await Promise.all([
      calculateHealthScore(auth.user.id),
      getHealthScoreHistory(auth.user.id, 12),
    ]);

    return jsonResponse({ ...score, history });
  } catch (error) {
    console.error('Error fetching health score:', error);
    return errorResponse('Failed to fetch health score', 500);
  }
}
