import { errorResponse, jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    const category = await prisma.customCategory.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return errorResponse('Custom category not found', 404);
    }

    await prisma.customCategory.delete({
      where: {
        id: category.id,
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting custom category:', error);
    return errorResponse('Failed to delete custom category', 500);
  }
}