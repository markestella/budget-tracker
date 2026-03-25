import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { deleteAccountSchema } from '@/lib/validations/settings';

export async function DELETE(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(deleteAccountSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    await prisma.user.delete({
      where: {
        id: auth.user.id,
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return errorResponse('Failed to delete account', 500);
  }
}