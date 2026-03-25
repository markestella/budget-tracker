import { Prisma } from '@prisma/client';

import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { expenseUpdateSchema } from '@/lib/validations/expenses';

const expenseInclude = {
  linkedAccount: {
    select: {
      accountName: true,
      accountType: true,
      bankName: true,
      id: true,
    },
  },
  linkedBudgetItem: {
    select: {
      category: true,
      description: true,
      id: true,
    },
  },
} satisfies Prisma.ExpenseInclude;

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

async function resolveLinkedBudgetItemId(userId: string, linkedBudgetItemId?: string | null) {
  if (!linkedBudgetItemId) {
    return null;
  }

  const item = await prisma.budgetItem.findFirst({
    where: {
      id: linkedBudgetItemId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!item) {
    throw new Error('Linked budget item not found');
  }

  return item.id;
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
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
    });

    if (!existingExpense) {
      return errorResponse('Expense not found', 404);
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(expenseUpdateSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const linkedAccountId = data.linkedAccountId === undefined
      ? existingExpense.linkedAccountId
      : await resolveLinkedAccountId(auth.user.id, data.linkedAccountId);
    const linkedBudgetItemId = data.linkedBudgetItemId === undefined
      ? existingExpense.linkedBudgetItemId
      : await resolveLinkedBudgetItemId(auth.user.id, data.linkedBudgetItemId);

    const expense = await prisma.expense.update({
      where: {
        id: existingExpense.id,
      },
      data: {
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
        ...(data.isRecurring !== undefined ? { isRecurring: data.isRecurring } : {}),
        ...(data.merchant !== undefined ? { merchant: data.merchant } : {}),
        ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
        linkedAccount: linkedAccountId
          ? {
              connect: {
                id: linkedAccountId,
              },
            }
          : {
              disconnect: true,
            },
        linkedBudgetItem: linkedBudgetItemId
          ? {
              connect: {
                id: linkedBudgetItemId,
              },
            }
          : {
              disconnect: true,
            },
      },
      include: expenseInclude,
    });

    return jsonResponse(expense);
  } catch (error) {
    console.error('Error updating expense:', error);

    if (error instanceof Error && (error.message === 'Linked account not found' || error.message === 'Linked budget item not found')) {
      return errorResponse(error.message, 404);
    }

    return errorResponse('Failed to update expense', 500);
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
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!expense) {
      return errorResponse('Expense not found', 404);
    }

    await prisma.expense.delete({
      where: {
        id: expense.id,
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return errorResponse('Failed to delete expense', 500);
  }
}