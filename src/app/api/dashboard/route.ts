import { NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type DecimalLike =
  | number
  | string
  | null
  | undefined
  | { toString(): string };

type TrendDirection = 'up' | 'down' | 'flat';

interface DashboardTrend {
  direction: TrendDirection;
  percentage: number;
}

interface DashboardMetricSummary {
  totalIncomeThisMonth: number;
  totalExpensesThisMonth: number;
  netSavings: number;
  budgetUsedPercent: number;
  topCategories: Array<{
    category: string;
    amount: number;
  }>;
  trends: {
    totalIncomeThisMonth: DashboardTrend;
    totalExpensesThisMonth: DashboardTrend;
    netSavings: DashboardTrend;
    budgetUsedPercent: DashboardTrend;
  };
}

function getMonthRange(baseDate: Date, offsetMonths = 0) {
  const start = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + offsetMonths,
    1
  );
  const end = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + offsetMonths + 1,
    1
  );

  return { start, end };
}

function toNumber(value: DecimalLike): number {
  if (value == null) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return Number(value.toString());
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function createTrend(current: number, previous: number): DashboardTrend {
  if (current === 0 && previous === 0) {
    return {
      direction: 'flat',
      percentage: 0,
    };
  }

  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'flat',
      percentage: current > 0 ? 100 : 0,
    };
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;

  if (change === 0) {
    return {
      direction: 'flat',
      percentage: 0,
    };
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: round(Math.abs(change)),
  };
}

async function resolveUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  if (session.user.id) {
    return session.user.id;
  }

  if (!session.user.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}

async function sumIncome(userId: string, start: Date, end: Date) {
  const result = await prisma.incomeRecord.aggregate({
    _sum: {
      actualAmount: true,
    },
    where: {
      userId,
      status: PaymentStatus.RECEIVED,
      actualDate: {
        gte: start,
        lt: end,
      },
    },
  });

  return toNumber(result._sum.actualAmount);
}

async function sumExpenses(userId: string, start: Date, end: Date) {
  const result = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId,
      expenseDate: {
        gte: start,
        lt: end,
      },
    },
  });

  return toNumber(result._sum.amount);
}

async function sumBudgets(userId: string, start: Date, end: Date) {
  const result = await prisma.budget.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      userId,
      startDate: {
        lt: end,
      },
      endDate: {
        gte: start,
      },
    },
  });

  return toNumber(result._sum.totalAmount);
}

async function getTopCategories(userId: string, start: Date, end: Date) {
  const categories = await prisma.expense.groupBy({
    by: ['category'],
    _sum: {
      amount: true,
    },
    where: {
      userId,
      expenseDate: {
        gte: start,
        lt: end,
      },
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 3,
  });

  return categories.map((entry) => ({
    category: entry.category,
    amount: round(toNumber(entry._sum.amount)),
  }));
}

export async function GET() {
  try {
    const userId = await resolveUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRange = getMonthRange(new Date());
    const previousRange = getMonthRange(new Date(), -1);

    const [
      currentIncome,
      previousIncome,
      currentExpenses,
      previousExpenses,
      currentBudget,
      previousBudget,
      topCategories,
    ] = await Promise.all([
      sumIncome(userId, currentRange.start, currentRange.end),
      sumIncome(userId, previousRange.start, previousRange.end),
      sumExpenses(userId, currentRange.start, currentRange.end),
      sumExpenses(userId, previousRange.start, previousRange.end),
      sumBudgets(userId, currentRange.start, currentRange.end),
      sumBudgets(userId, previousRange.start, previousRange.end),
      getTopCategories(userId, currentRange.start, currentRange.end),
    ]);

    const currentNetSavings = currentIncome - currentExpenses;
    const previousNetSavings = previousIncome - previousExpenses;
    const currentBudgetUsedPercent =
      currentBudget > 0 ? (currentExpenses / currentBudget) * 100 : 0;
    const previousBudgetUsedPercent =
      previousBudget > 0 ? (previousExpenses / previousBudget) * 100 : 0;

    const response: DashboardMetricSummary = {
      totalIncomeThisMonth: round(currentIncome),
      totalExpensesThisMonth: round(currentExpenses),
      netSavings: round(currentNetSavings),
      budgetUsedPercent: round(currentBudgetUsedPercent),
      topCategories,
      trends: {
        totalIncomeThisMonth: createTrend(currentIncome, previousIncome),
        totalExpensesThisMonth: createTrend(currentExpenses, previousExpenses),
        netSavings: createTrend(currentNetSavings, previousNetSavings),
        budgetUsedPercent: createTrend(
          currentBudgetUsedPercent,
          previousBudgetUsedPercent
        ),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);

    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}