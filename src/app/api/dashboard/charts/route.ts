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

interface MonthlyTrendDatum {
  month: string;
  income: number;
  expenses: number;
}

interface CategoryBreakdownDatum {
  category: string;
  amount: number;
  percentage: number;
}

interface BudgetProgressDatum {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
}

interface DashboardChartsResponse {
  monthlyTrend: MonthlyTrendDatum[];
  categoryBreakdown: CategoryBreakdownDatum[];
  budgetProgress: BudgetProgressDatum[];
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

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
  }).format(date);
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
      date: {
        gte: start,
        lt: end,
      },
    },
  });

  return toNumber(result._sum.amount);
}

async function getCurrentMonthExpenseGroups(userId: string, start: Date, end: Date) {
  const groups = await prisma.expense.groupBy({
    by: ['category'],
    _sum: {
      amount: true,
    },
    where: {
      userId,
      date: {
        gte: start,
        lt: end,
      },
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });

  return groups.map((entry) => ({
    category: entry.category,
    amount: round(toNumber(entry._sum.amount)),
  }));
}

async function getCurrentMonthBudgets(userId: string, start: Date, end: Date) {
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      startDate: {
        lt: end,
      },
      endDate: {
        gte: start,
      },
    },
    select: {
      name: true,
      totalAmount: true,
    },
  });

  return budgets.map((budget) => ({
    category: budget.name?.trim() || null,
    amount: round(toNumber(budget.totalAmount)),
  }));
}

export async function GET() {
  try {
    const userId = await resolveUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const currentRange = getMonthRange(now);
    const monthOffsets = [-5, -4, -3, -2, -1, 0];

    const monthlyTrend = await Promise.all(
      monthOffsets.map(async (offset) => {
        const range = getMonthRange(now, offset);
        const [income, expenses] = await Promise.all([
          sumIncome(userId, range.start, range.end),
          sumExpenses(userId, range.start, range.end),
        ]);

        return {
          month: formatMonthLabel(range.start),
          income: round(income),
          expenses: round(expenses),
        };
      })
    );

    const [expenseGroups, currentBudgets] = await Promise.all([
      getCurrentMonthExpenseGroups(userId, currentRange.start, currentRange.end),
      getCurrentMonthBudgets(userId, currentRange.start, currentRange.end),
    ]);

    const totalSpent = expenseGroups.reduce((sum, entry) => sum + entry.amount, 0);

    const categoryBreakdown = expenseGroups.map((entry) => ({
      category: entry.category,
      amount: round(entry.amount),
      percentage:
        totalSpent > 0 ? round((entry.amount / totalSpent) * 100) : 0,
    }));

    const spentByCategory = new Map(
      expenseGroups.map((entry) => [entry.category, entry.amount])
    );
    const budgetByCategory = new Map<string, number>();

    for (const budget of currentBudgets) {
      if (!budget.category) {
        continue;
      }

      budgetByCategory.set(
        budget.category,
        round((budgetByCategory.get(budget.category) ?? 0) + budget.amount)
      );
    }

    const categories = Array.from(
      new Set([...spentByCategory.keys(), ...budgetByCategory.keys()])
    ).sort((left, right) => {
      const leftSpent = spentByCategory.get(left) ?? 0;
      const rightSpent = spentByCategory.get(right) ?? 0;

      return rightSpent - leftSpent || left.localeCompare(right);
    });

    const budgetProgress = categories.map((category) => {
      const spent = round(spentByCategory.get(category) ?? 0);
      const budget = round(budgetByCategory.get(category) ?? 0);
      const percentage =
        budget > 0 ? round((spent / budget) * 100) : spent > 0 ? 100 : 0;

      return {
        category,
        spent,
        budget,
        percentage,
      };
    });

    const response: DashboardChartsResponse = {
      monthlyTrend,
      categoryBreakdown,
      budgetProgress,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);

    return NextResponse.json(
      { error: 'Failed to fetch dashboard charts' },
      { status: 500 }
    );
  }
}