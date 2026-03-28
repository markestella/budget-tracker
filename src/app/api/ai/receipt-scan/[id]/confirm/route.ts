import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { receiptConfirmSchema } from '@/lib/validations/ai';
import { NextRequest } from 'next/server';
import { BudgetCategory } from '@prisma/client';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const premiumBlock = await checkPremium(auth.user.id);
  if (premiumBlock) return premiumBlock;

  const { id } = await params;

  const scan = await prisma.receiptScan.findFirst({
    where: { id, userId: auth.user.id, status: 'PENDING' },
  });

  if (!scan) {
    return errorResponse('Receipt scan not found or already processed', 404);
  }

  const body = await request.json();
  const validation = validateRequest(receiptConfirmSchema, body);
  if ('error' in validation) return validation.error;

  const { merchantName, totalAmount, date, category, description } = validation.data;

  // Create expense from confirmed scan
  const expense = await prisma.expense.create({
    data: {
      userId: auth.user.id,
      amount: totalAmount,
      category: ((category || scan.suggestedCategory || 'MISCELLANEOUS') as BudgetCategory),
      merchant: merchantName || scan.merchantName || 'Unknown merchant',
      date: date ? new Date(date) : scan.scanDate || new Date(),
      notes: description || undefined,
    },
  });

  // Mark scan as confirmed
  await prisma.receiptScan.update({
    where: { id: scan.id },
    data: { status: 'CONFIRMED' },
  });

  return jsonResponse({ success: true, expense });
}
