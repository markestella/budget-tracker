import { Prisma } from '@prisma/client';

import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { calculateBudgetEndDate } from '@/lib/budgets';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { budgetItemUpdateSchema } from '@/lib/validations/budgets';

const budgetItemInclude = {
  linkedAccount: {
    select: {
      id: true,
      accountName: true,
      accountType: true,
      bankName: true,
    },
  },
} satisfies Prisma.BudgetItemInclude;

async function resolveLinkedAccountId(userId: string, linkedAccountId?: string | null) {
  if (!linkedAccountId) {
    return null;
  }

  const account = await prisma.financialAccount.findFirst({
    where: {
      id: linkedAccountId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!account) {
    throw new Error('Linked account not found');
  }

  return account.id;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    const existingItem = await prisma.budgetItem.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
    });

    if (!existingItem) {
      return errorResponse('Budget item not found', 404);
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(budgetItemUpdateSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const nextType = data.type ?? existingItem.type;
    const linkedAccountId = data.linkedAccountId === undefined
      ? existingItem.linkedAccountId
      : await resolveLinkedAccountId(auth.user.id, data.linkedAccountId);
    const updateData: Prisma.BudgetItemUpdateInput = {
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.merchant !== undefined ? { merchant: data.merchant ?? null } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      linkedAccount: linkedAccountId
        ? {
            connect: {
              id: linkedAccountId,
            },
          }
        : {
            disconnect: true,
          },
    };

    if (data.markPaid && nextType !== 'DURATION') {
      return errorResponse('Only duration budget items can be marked paid', 400);
    }

    if (nextType === 'DURATION') {
      const totalMonths = data.totalMonths ?? existingItem.totalMonths;
      const startDate = data.startDate
        ? new Date(data.startDate)
        : existingItem.startDate;

      if (!totalMonths || !startDate) {
        return errorResponse('Duration budget items require totalMonths and startDate', 400);
      }

      const nextCompletedPayments = data.markPaid
        ? Math.min(existingItem.completedPayments + 1, totalMonths)
        : data.completedPayments !== undefined
          ? Math.min(Math.max(data.completedPayments, 0), totalMonths)
          : existingItem.completedPayments;

      Object.assign(updateData, {
        completedPayments: nextCompletedPayments,
        endDate: calculateBudgetEndDate(startDate, totalMonths),
        startDate,
        totalMonths,
        type: nextType,
      });
    } else {
      Object.assign(updateData, {
        completedPayments: 0,
        endDate: null,
        startDate: null,
        totalMonths: null,
        type: nextType,
      });
    }

    const item = await prisma.budgetItem.update({
      where: {
        id: existingItem.id,
      },
      data: updateData,
      include: budgetItemInclude,
    });

    return jsonResponse(item);
  } catch (error) {
    console.error('Error updating budget item:', error);

    if (error instanceof Error && error.message === 'Linked account not found') {
      return errorResponse(error.message, 404);
    }

    return errorResponse('Failed to update budget item', 500);
  }
}

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
    const existingItem = await prisma.budgetItem.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingItem) {
      return errorResponse('Budget item not found', 404);
    }

    await prisma.budgetItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting budget item:', error);
    return errorResponse('Failed to delete budget item', 500);
  }
}