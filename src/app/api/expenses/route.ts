import { Prisma } from '@prisma/client';

import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import {
  expensePayloadSchema,
  parseExpenseListParams,
} from '@/lib/validations/expenses';

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

function buildExpenseWhere(
  userId: string,
  filters: ReturnType<typeof parseExpenseListParams>,
): Prisma.ExpenseWhereInput {
  const whereClauses: Prisma.ExpenseWhereInput[] = [{ userId }];

  if (filters.category.length > 0) {
    whereClauses.push({ category: { in: filters.category } });
  }

  if (filters.accountId) {
    whereClauses.push({ linkedAccountId: filters.accountId });
  }

  if (filters.startDate || filters.endDate) {
    whereClauses.push({
      date: {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      },
    });
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    whereClauses.push({
      amount: {
        ...(filters.minAmount !== undefined ? { gte: filters.minAmount } : {}),
        ...(filters.maxAmount !== undefined ? { lte: filters.maxAmount } : {}),
      },
    });
  }

  if (filters.search) {
    whereClauses.push({
      OR: [
        { merchant: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ],
    });
  }

  return whereClauses.length === 1 ? whereClauses[0] : { AND: whereClauses };
}

function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) {
    return 0;
  }

  return typeof value === 'number' ? value : Number(value.toString());
}

export async function GET(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const searchParams = new URL(request.url).searchParams;
    const filters = parseExpenseListParams(searchParams);
    const where = buildExpenseWhere(auth.user.id, filters);
    const page = filters.page;
    const pageSize = filters.pageSize;
    const skip = (page - 1) * pageSize;

    const [expenses, totalCount, aggregate, groupedByAccount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: expenseInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({
        _sum: {
          amount: true,
        },
        where,
      }),
      prisma.expense.groupBy({
        by: ['linkedAccountId'],
        _count: {
          _all: true,
        },
        _sum: {
          amount: true,
        },
        where: {
          ...where,
          linkedAccountId: {
            not: null,
          },
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),
    ]);

    const accountIds = groupedByAccount
      .map((entry) => entry.linkedAccountId)
      .filter((value): value is string => Boolean(value));

    const accounts = accountIds.length > 0
      ? await prisma.financialAccount.findMany({
          where: {
            id: { in: accountIds },
            userId: auth.user.id,
          },
          select: {
            accountName: true,
            accountType: true,
            bankName: true,
            id: true,
          },
        })
      : [];

    const accountsById = new Map(accounts.map((account) => [account.id, account]));

    return jsonResponse({
      data: expenses,
      page,
      pageSize,
      summaries: {
        accountUsage: groupedByAccount.flatMap((entry) => {
          if (!entry.linkedAccountId) {
            return [];
          }

          const account = accountsById.get(entry.linkedAccountId);

          if (!account) {
            return [];
          }

          return [{
            accountId: account.id,
            accountName: account.accountName,
            accountType: account.accountType,
            bankName: account.bankName,
            totalAmount: toNumber(entry._sum.amount),
            transactionCount: entry._count._all,
          }];
        }),
        totalAmount: toNumber(aggregate._sum.amount),
      },
      totalCount,
      totalPages: Math.max(Math.ceil(totalCount / pageSize), 1),
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);

    if (error instanceof Error && error.message.includes('date')) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Failed to fetch expenses', 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(expensePayloadSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const [linkedAccountId, linkedBudgetItemId] = await Promise.all([
      resolveLinkedAccountId(auth.user.id, data.linkedAccountId),
      resolveLinkedBudgetItemId(auth.user.id, data.linkedBudgetItemId),
    ]);

    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        category: data.category,
        date: new Date(data.date),
        isRecurring: data.isRecurring ?? false,
        merchant: data.merchant,
        notes: data.notes ?? null,
        user: {
          connect: {
            id: auth.user.id,
          },
        },
        ...(linkedAccountId
          ? {
              linkedAccount: {
                connect: {
                  id: linkedAccountId,
                },
              },
            }
          : {}),
        ...(linkedBudgetItemId
          ? {
              linkedBudgetItem: {
                connect: {
                  id: linkedBudgetItemId,
                },
              },
            }
          : {}),
      },
      include: expenseInclude,
    });

    return jsonResponse(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);

    if (error instanceof Error && (error.message === 'Linked account not found' || error.message === 'Linked budget item not found')) {
      return errorResponse(error.message, 404);
    }

    return errorResponse('Failed to create expense', 500);
  }
}