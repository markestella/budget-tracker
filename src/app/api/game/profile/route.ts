import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { getGameProfileWithProgress } from '@/lib/game/xpService';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const profile = await getGameProfileWithProgress(auth.user.id);
    return jsonResponse(profile);
  } catch (error) {
    console.error('Error fetching game profile:', error);
    return errorResponse('Failed to fetch game profile', 500);
  }
}
