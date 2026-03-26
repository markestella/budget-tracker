import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { ensureNotificationPreferences } from '@/lib/notifications/preferences';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { pushSubscriptionSchema } from '@/lib/validations/notifications';

export async function POST(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(pushSubscriptionSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    await ensureNotificationPreferences(auth.user.id);

    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          endpoint: validation.data.endpoint,
          userId: auth.user.id,
        },
      },
      update: {
        auth: validation.data.auth,
        p256dh: validation.data.p256dh,
      },
      create: {
        auth: validation.data.auth,
        endpoint: validation.data.endpoint,
        p256dh: validation.data.p256dh,
        userId: auth.user.id,
      },
      select: {
        createdAt: true,
        endpoint: true,
        id: true,
      },
    });

    return jsonResponse({ success: true, subscription });
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return errorResponse('Failed to subscribe for notifications', 500);
  }
}
