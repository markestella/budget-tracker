import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { getAvatar, getAllItemsWithStatus, updateAvatar } from '@/lib/game/avatar/avatarService';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const [avatar, items] = await Promise.all([
      getAvatar(auth.user.id),
      getAllItemsWithStatus(auth.user.id),
    ]);

    return jsonResponse({ avatar, items });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return errorResponse('Failed to fetch avatar', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const body = await request.json().catch(() => null);

    if (!body || !body.baseId) {
      return errorResponse('baseId is required', 400);
    }

    const avatar = await updateAvatar(auth.user.id, {
      baseId: body.baseId,
      hatId: body.hatId ?? null,
      backgroundId: body.backgroundId ?? null,
      frameId: body.frameId ?? null,
      accessoryId: body.accessoryId ?? null,
      title: body.title ?? null,
    });

    return jsonResponse(avatar);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not unlocked')) {
      return errorResponse(error.message, 400);
    }
    console.error('Error updating avatar:', error);
    return errorResponse('Failed to update avatar', 500);
  }
}
