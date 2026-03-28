import { Decimal } from '@prisma/client/runtime/library';

import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const items = await prisma.wishlistItem.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate weekly savings rate from last 30 days of fund additions
  // We approximate by looking at savedAmount growth (no separate ledger)
  const totalSaved = items.reduce(
    (sum, item) => sum.plus(item.savedAmount),
    new Decimal(0),
  );
  const weeklyRate = totalSaved.div(4).toNumber(); // rough 4-week average

  const enriched = items.map((item) => {
    const remaining = new Decimal(item.price).minus(item.savedAmount);
    const weeksToAffordable =
      item.status !== 'SAVING' || remaining.lte(0) || weeklyRate <= 0
        ? null
        : Math.ceil(remaining.toNumber() / weeklyRate);

    return {
      ...item,
      weeksToAffordable,
    };
  });

  const affordable = enriched.filter(
    (item) => new Decimal(item.savedAmount).gte(item.price),
  );

  return jsonResponse({ items: enriched, affordable });
}
