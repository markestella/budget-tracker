import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { getAllItemsWithStatus } from '@/lib/game/avatar/avatarService';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const items = await getAllItemsWithStatus(auth.user.id);
    return jsonResponse(items);
  } catch (error) {
    console.error('Error fetching avatar items:', error);
    return errorResponse('Failed to fetch avatar items', 500);
  }
}
