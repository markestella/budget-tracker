import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { customCategorySchema } from '@/lib/validations/settings';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const categories = await prisma.customCategory.findMany({
      where: {
        userId: auth.user.id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return jsonResponse(categories);
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return errorResponse('Failed to fetch custom categories', 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(customCategorySchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const category = await prisma.customCategory.create({
      data: {
        name: validation.data.name,
        user: {
          connect: {
            id: auth.user.id,
          },
        },
      },
    });

    return jsonResponse(category, { status: 201 });
  } catch (error) {
    console.error('Error creating custom category:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return errorResponse('Category already exists', 409);
    }

    return errorResponse('Failed to create custom category', 500);
  }
}