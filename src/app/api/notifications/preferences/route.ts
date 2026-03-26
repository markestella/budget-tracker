import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { ensureNotificationPreferences } from '@/lib/notifications/preferences';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { notificationPreferencesSchema } from '@/lib/validations/notifications';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const preferences = await ensureNotificationPreferences(auth.user.id);
    return jsonResponse(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return errorResponse('Failed to fetch notification preferences', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(notificationPreferencesSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    await ensureNotificationPreferences(auth.user.id);

    const preferences = await prisma.notificationPreference.update({
      where: { userId: auth.user.id },
      data: validation.data,
    });

    return jsonResponse(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return errorResponse('Failed to update notification preferences', 500);
  }
}
