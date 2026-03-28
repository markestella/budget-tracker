import { NextRequest } from 'next/server';

import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { updateWishlistItemSchema } from '@/lib/validations/wishlist';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const { id } = await context.params;
  const item = await prisma.wishlistItem.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!item) {
    return errorResponse('Wishlist item not found', 404);
  }

  return jsonResponse(item);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const { id } = await context.params;
  const item = await prisma.wishlistItem.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!item) {
    return errorResponse('Wishlist item not found', 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const validation = validateRequest(updateWishlistItemSchema, body);
  if ('error' in validation) return validation.error;

  const data = validation.data;

  // Enforce: only AFFORDABLE items can be marked PURCHASED
  if (data.status === 'PURCHASED' && item.status !== 'AFFORDABLE') {
    return errorResponse('Only affordable items can be marked as purchased', 400);
  }

  // Check duplicate name if changing name
  if (data.name && data.name !== item.name) {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_name: { userId: auth.user.id, name: data.name } },
    });
    if (existing) {
      return errorResponse('A wishlist item with this name already exists', 409);
    }
  }

  const updated = await prisma.wishlistItem.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.productUrl !== undefined && { productUrl: data.productUrl }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  return jsonResponse(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const { id } = await context.params;
  const item = await prisma.wishlistItem.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!item) {
    return errorResponse('Wishlist item not found', 404);
  }

  await prisma.wishlistItem.delete({ where: { id } });

  return jsonResponse({ success: true });
}
