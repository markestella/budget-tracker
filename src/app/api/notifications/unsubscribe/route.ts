import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { unsubscribeSchema } from '@/lib/validations/notifications';

export async function DELETE(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(unsubscribeSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: validation.data.endpoint,
        userId: auth.user.id,
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error unsubscribing notifications:', error);
    return errorResponse('Failed to unsubscribe notifications', 500);
  }
}
