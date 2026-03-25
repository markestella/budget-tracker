import bcrypt from 'bcryptjs';

import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import {
  passwordUpdateSchema,
  preferencesUpdateSchema,
  profileUpdateSchema,
} from '@/lib/validations/settings';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.user.id,
      },
      select: {
        bio: true,
        customCategories: {
          orderBy: {
            name: 'asc',
          },
        },
        email: true,
        image: true,
        lastExportedAt: true,
        name: true,
        preferredCurrency: true,
        preferredTheme: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return jsonResponse(user);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const mode = typeof body === 'object' && body && 'mode' in body ? body.mode : 'profile';

    if (mode === 'password') {
      const validation = validateRequest(passwordUpdateSchema, body);

      if ('error' in validation) {
        return validation.error;
      }

      const data = validation.data;
      const user = await prisma.user.findUnique({
        where: {
          id: auth.user.id,
        },
        select: {
          password: true,
        },
      });

      if (!user) {
        return errorResponse('User not found', 404);
      }

      const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);

      if (!isValidPassword) {
        return errorResponse('Current password is incorrect', 400);
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      await prisma.user.update({
        where: {
          id: auth.user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return jsonResponse({ success: true });
    }

    if (mode === 'preferences') {
      const validation = validateRequest(preferencesUpdateSchema, body);

      if ('error' in validation) {
        return validation.error;
      }

      const settings = await prisma.user.update({
        where: {
          id: auth.user.id,
        },
        data: {
          ...(validation.data.preferredTheme !== undefined ? { preferredTheme: validation.data.preferredTheme } : {}),
        },
        select: {
          bio: true,
          customCategories: {
            orderBy: {
              name: 'asc',
            },
          },
          email: true,
          image: true,
          lastExportedAt: true,
          name: true,
          preferredCurrency: true,
          preferredTheme: true,
        },
      });

      return jsonResponse(settings);
    }

    const validation = validateRequest(profileUpdateSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const user = await prisma.user.update({
      where: {
        id: auth.user.id,
      },
      data: {
        bio: validation.data.bio ?? null,
        image: validation.data.image ?? null,
        name: validation.data.name,
      },
      select: {
        bio: true,
        customCategories: {
          orderBy: {
            name: 'asc',
          },
        },
        email: true,
        image: true,
        lastExportedAt: true,
        name: true,
        preferredCurrency: true,
        preferredTheme: true,
      },
    });

    return jsonResponse(user);
  } catch (error) {
    console.error('Error updating settings:', error);
    return errorResponse('Failed to update settings', 500);
  }
}