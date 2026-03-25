import { Prisma } from '@prisma/client';

import { errorResponse, jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

const expenseInclude = {
  linkedAccount: {
    select: {
      accountName: true,
      accountType: true,
      bankName: true,
      id: true,
    },
  },
} satisfies Prisma.ExpenseInclude;

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: auth.user.id,
      },
      include: expenseInclude,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });

    return jsonResponse(expenses);
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    return errorResponse('Failed to fetch recent expenses', 500);
  }
}