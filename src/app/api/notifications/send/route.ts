import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { sendBulkNotifications, sendPushNotification } from '@/lib/notifications/sender';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { notificationSendSchema } from '@/lib/validations/notifications';

function hasInternalApiKey(request: Request) {
  const expectedApiKey = process.env.NOTIFICATIONS_API_KEY;

  if (!expectedApiKey) {
    return false;
  }

  return request.headers.get('authorization') === `Bearer ${expectedApiKey}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const validation = validateRequest(notificationSendSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const isInternalRequest = hasInternalApiKey(request);
    let targetUserIds = validation.data.userIds ?? [];

    if (validation.data.userId) {
      targetUserIds = [...targetUserIds, validation.data.userId];
    }

    if (!isInternalRequest) {
      const auth = await resolveAuthenticatedUser();

      if ('response' in auth) {
        return auth.response;
      }

      if (!validation.data.test) {
        return errorResponse('Internal API key required for non-test notifications', 401);
      }

      targetUserIds = [auth.user.id];
    }

    if (targetUserIds.length === 0) {
      return errorResponse('No target users provided', 400);
    }

    const notification = {
      body: validation.data.body,
      icon: validation.data.icon,
      tag: validation.data.tag,
      title: validation.data.title,
      url: validation.data.url,
    };

    if (targetUserIds.length === 1) {
      const result = await sendPushNotification(targetUserIds[0], notification);
      return jsonResponse({ success: true, result });
    }

    const result = await sendBulkNotifications(targetUserIds, notification);
    return jsonResponse({ success: true, result });
  } catch (error) {
    console.error('Error sending notification:', error);
    return errorResponse(error instanceof Error ? error.message : 'Failed to send notification', 500);
  }
}
