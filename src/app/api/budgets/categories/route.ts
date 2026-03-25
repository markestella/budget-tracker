import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import {
  budgetCategoryLabels,
  budgetCategoryValues,
  getMonthDateRange,
  normalizeCategoryValue,
  toNumber,
} from '@/lib/budgets';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { categoryBudgetSchema } from '@/lib/validations/budgets';

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const { start, end } = getMonthDateRange();
    const [categoryBudgets, expensesByCategory] = await Promise.all([
      prisma.categoryBudget.findMany({
        where: { userId: auth.user.id },
        orderBy: { category: 'asc' },
      }),
      prisma.expense.groupBy({
        by: ['category'],
        _sum: {
          amount: true,
        },
        where: {
          userId: auth.user.id,
          expenseDate: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

    const budgetMap = new Map(categoryBudgets.map((entry) => [entry.category, entry]));
    const spentMap = new Map(
      expensesByCategory.map((entry) => [
        normalizeCategoryValue(entry.category),
        toNumber(entry._sum.amount),
      ]),
    );

    const rows = budgetCategoryValues.map((category) => {
      const categoryBudget = budgetMap.get(category);
      const spentAmount = roundCurrency(spentMap.get(category) ?? 0);
      const monthlyLimit = categoryBudget ? toNumber(categoryBudget.monthlyLimit) : null;

      return {
        category,
        categoryLabel: budgetCategoryLabels[category],
        id: categoryBudget?.id ?? null,
        monthlyLimit,
        rollover: categoryBudget?.rollover ?? false,
        spentAmount,
        utilizationPercent: monthlyLimit && monthlyLimit > 0
          ? roundCurrency((spentAmount / monthlyLimit) * 100)
          : 0,
      };
    });

    return jsonResponse(rows);
  } catch (error) {
    console.error('Error fetching category budgets:', error);
    return errorResponse('Failed to fetch category budgets', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(categoryBudgetSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const categoryBudget = await prisma.categoryBudget.upsert({
      where: {
        userId_category: {
          userId: auth.user.id,
          category: data.category,
        },
      },
      create: {
        category: data.category,
        monthlyLimit: data.monthlyLimit,
        rollover: data.rollover ?? false,
        userId: auth.user.id,
      },
      update: {
        monthlyLimit: data.monthlyLimit,
        rollover: data.rollover ?? false,
      },
    });

    const { start, end } = getMonthDateRange();
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      _sum: {
        amount: true,
      },
      where: {
        userId: auth.user.id,
        expenseDate: {
          gte: start,
          lte: end,
        },
      },
    });
    const spentAmount = roundCurrency(
      expensesByCategory.reduce((total, entry) => {
        if (normalizeCategoryValue(entry.category) !== data.category) {
          return total;
        }

        return total + toNumber(entry._sum.amount);
      }, 0),
    );
    const monthlyLimit = roundCurrency(toNumber(categoryBudget.monthlyLimit));

    return jsonResponse({
      ...categoryBudget,
      categoryLabel: budgetCategoryLabels[data.category],
      monthlyLimit,
      spentAmount,
      utilizationPercent: monthlyLimit > 0
        ? roundCurrency((spentAmount / monthlyLimit) * 100)
        : 0,
    });
  } catch (error) {
    console.error('Error saving category budget:', error);
    return errorResponse('Failed to save category budget', 500);
  }
}