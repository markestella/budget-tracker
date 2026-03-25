import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { savingsTransactionSchema } from '@/lib/validations/savings';

function applyBalanceDelta(currentBalance: number, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST') {
  if (type === 'WITHDRAWAL') {
    return currentBalance - amount;
  }

  return currentBalance + amount;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    const goal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
    });

    if (!goal) {
      return errorResponse('Savings goal not found', 404);
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(savingsTransactionSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const nextBalance = applyBalanceDelta(Number(goal.currentBalance.toString()), data.amount, data.type);

    if (nextBalance < 0) {
      return errorResponse('Withdrawal exceeds current balance', 400);
    }

    const transaction = await prisma.$transaction(async (transactionClient) => {
      const createdTransaction = await transactionClient.savingsTransaction.create({
        data: {
          amount: data.amount,
          date: new Date(data.date),
          notes: data.notes ?? null,
          savingsGoal: {
            connect: {
              id: goal.id,
            },
          },
          type: data.type,
          user: {
            connect: {
              id: auth.user.id,
            },
          },
        },
      });

      await transactionClient.savingsGoal.update({
        where: {
          id: goal.id,
        },
        data: {
          currentBalance: nextBalance,
          lastUpdatedBalance: new Date(data.date),
        },
      });

      return createdTransaction;
    });

    return jsonResponse(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating savings transaction:', error);
    return errorResponse('Failed to create savings transaction', 500);
  }
}