import { NextRequest } from 'next/server';

import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createWishlistItemSchema } from '@/lib/validations/wishlist';

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const items = await prisma.wishlistItem.findMany({
    where: { userId: auth.user.id },
    orderBy: [
      { priority: 'asc' }, // HIGH=0, MEDIUM=1, LOW=2 — Prisma enum order
      { createdAt: 'desc' },
    ],
  });

  return jsonResponse(items);
}

export async function POST(request: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const validation = validateRequest(createWishlistItemSchema, body);
  if ('error' in validation) return validation.error;

  const { name, price, imageUrl, productUrl, priority } = validation.data;

  // Check for duplicate name
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_name: { userId: auth.user.id, name } },
  });
  if (existing) {
    return errorResponse('A wishlist item with this name already exists', 409);
  }

  const item = await prisma.wishlistItem.create({
    data: {
      userId: auth.user.id,
      name,
      price,
      imageUrl: imageUrl ?? null,
      productUrl: productUrl ?? null,
      priority: priority ?? 'MEDIUM',
    },
  });

  return jsonResponse(item, { status: 201 });
}
