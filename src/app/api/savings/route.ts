import { Prisma } from '@prisma/client';

import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { savingsGoalSchema } from '@/lib/validations/savings';

const savingsGoalInclude = {
  transactions: {
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: 5,
  },
} satisfies Prisma.SavingsGoalInclude;

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const goals = await prisma.savingsGoal.findMany({
      where: {
        userId: auth.user.id,
      },
      include: savingsGoalInclude,
      orderBy: [{ createdAt: 'desc' }],
    });

    return jsonResponse(goals);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return errorResponse('Failed to fetch savings goals', 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(savingsGoalSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const goal = await prisma.savingsGoal.create({
      data: {
        currentBalance: data.currentBalance,
        institution: data.institution,
        interestRate: data.interestRate ?? null,
        lastUpdatedBalance: data.lastUpdatedBalance ? new Date(data.lastUpdatedBalance) : new Date(data.startDate),
        monthlyContribution: data.monthlyContribution,
        name: data.name,
        notes: data.notes ?? null,
        startDate: new Date(data.startDate),
        status: data.status ?? 'ACTIVE',
        targetAmount: data.targetAmount ?? null,
        type: data.type,
        user: {
          connect: {
            id: auth.user.id,
          },
        },
      },
      include: savingsGoalInclude,
    });

    return jsonResponse(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return errorResponse('Failed to create savings goal', 500);
  }
}