import { Prisma } from '@prisma/client';

import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { savingsGoalUpdateSchema } from '@/lib/validations/savings';

const savingsGoalInclude = {
  transactions: {
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: 5,
  },
} satisfies Prisma.SavingsGoalInclude;

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
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
    });

    if (!existingGoal) {
      return errorResponse('Savings goal not found', 404);
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(savingsGoalUpdateSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const goal = await prisma.savingsGoal.update({
      where: {
        id: existingGoal.id,
      },
      data: {
        ...(data.currentBalance !== undefined ? { currentBalance: data.currentBalance } : {}),
        ...(data.institution !== undefined ? { institution: data.institution } : {}),
        ...(data.interestRate !== undefined ? { interestRate: data.interestRate ?? null } : {}),
        ...(data.lastUpdatedBalance !== undefined ? { lastUpdatedBalance: new Date(data.lastUpdatedBalance) } : {}),
        ...(data.monthlyContribution !== undefined ? { monthlyContribution: data.monthlyContribution } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
        ...(data.startDate !== undefined ? { startDate: new Date(data.startDate) } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.targetAmount !== undefined ? { targetAmount: data.targetAmount ?? null } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
      },
      include: savingsGoalInclude,
    });

    return jsonResponse(goal);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return errorResponse('Failed to update savings goal', 500);
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
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingGoal) {
      return errorResponse('Savings goal not found', 404);
    }

    await prisma.savingsGoal.delete({
      where: {
        id: existingGoal.id,
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return errorResponse('Failed to delete savings goal', 500);
  }
}