import { NextRequest } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';

import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { addFundsSchema } from '@/lib/validations/wishlist';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const { id } = await context.params;
  const item = await prisma.wishlistItem.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!item) {
    return errorResponse('Wishlist item not found', 404);
  }

  if (item.status === 'PURCHASED') {
    return errorResponse('Cannot add funds to a purchased item', 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const validation = validateRequest(addFundsSchema, body);
  if ('error' in validation) return validation.error;

  const { amount } = validation.data;
  const newSavedAmount = new Decimal(item.savedAmount).plus(new Decimal(amount));
  const isNowAffordable = newSavedAmount.gte(item.price);

  // Calculate milestone
  const oldPercentage = new Decimal(item.savedAmount).div(item.price).mul(100).toNumber();
  const newPercentage = newSavedAmount.div(item.price).mul(100).toNumber();
  const milestones = [25, 50, 75, 100];
  const crossedMilestone = milestones.find((m) => oldPercentage < m && newPercentage >= m) ?? null;

  const updated = await prisma.wishlistItem.update({
    where: { id },
    data: {
      savedAmount: newSavedAmount,
      ...(isNowAffordable && item.status === 'SAVING' ? { status: 'AFFORDABLE' } : {}),
    },
  });

  return jsonResponse({
    item: updated,
    crossedMilestone,
  });
}
