import { errorResponse, jsonResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET(
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
      select: {
        id: true,
      },
    });

    if (!goal) {
      return errorResponse('Savings goal not found', 404);
    }

    const transactions = await prisma.savingsTransaction.findMany({
      where: {
        savingsGoalId: goal.id,
        userId: auth.user.id,
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    return jsonResponse(transactions);
  } catch (error) {
    console.error('Error fetching savings history:', error);
    return errorResponse('Failed to fetch savings history', 500);
  }
}