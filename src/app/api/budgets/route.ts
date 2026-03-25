import { Prisma } from '@prisma/client';

import { errorResponse, jsonResponse, validateRequest } from '@/lib/api-utils';
import { calculateBudgetEndDate, createBudgetRangeOverlap } from '@/lib/budgets';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import {
  budgetItemSchema,
  parseBudgetListParams,
} from '@/lib/validations/budgets';

const budgetItemInclude = {
  linkedAccount: {
    select: {
      id: true,
      accountName: true,
      accountType: true,
      bankName: true,
    },
  },
} satisfies Prisma.BudgetItemInclude;

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

export async function GET(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const searchParams = new URL(request.url).searchParams;
    const filters = parseBudgetListParams(searchParams);
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
    const whereClauses: Prisma.BudgetItemWhereInput[] = [
      { userId: auth.user.id },
    ];

    if (filters.type) {
      whereClauses.push({ type: filters.type });
    }

    if (filters.category.length > 0) {
      whereClauses.push({ category: { in: filters.category } });
    }

    if (filters.search) {
      whereClauses.push({
        OR: [
          { description: { contains: filters.search, mode: 'insensitive' } },
          { merchant: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }

    const rangeOverlap = createBudgetRangeOverlap(startDate, endDate);
    if (rangeOverlap) {
      whereClauses.push(rangeOverlap);
    }

    const where: Prisma.BudgetItemWhereInput =
      whereClauses.length === 1 ? whereClauses[0] : { AND: whereClauses };

    const items = await prisma.budgetItem.findMany({
      where,
      include: budgetItemInclude,
      orderBy: [
        { category: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return jsonResponse(items);
  } catch (error) {
    console.error('Error fetching budget items:', error);

    if (error instanceof Error && error.message.includes('Start date')) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Failed to fetch budget items', 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await resolveAuthenticatedUser();

    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const validation = validateRequest(budgetItemSchema, body);

    if ('error' in validation) {
      return validation.error;
    }

    const data = validation.data;
    const linkedAccountId = await resolveLinkedAccountId(auth.user.id, data.linkedAccountId);
    const createData: Prisma.BudgetItemCreateInput = {
      amount: data.amount,
      category: data.category,
      description: data.description,
      dueDate: data.dueDate,
      isActive: data.isActive ?? true,
      merchant: data.merchant ?? null,
      type: data.type,
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
      ...(data.type === 'DURATION'
        ? {
            completedPayments: 0,
            endDate: calculateBudgetEndDate(new Date(data.startDate), data.totalMonths),
            startDate: new Date(data.startDate),
            totalMonths: data.totalMonths,
          }
        : {}),
    };

    const item = await prisma.budgetItem.create({
      data: createData,
      include: budgetItemInclude,
    });

    return jsonResponse(item, { status: 201 });
  } catch (error) {
    console.error('Error creating budget item:', error);

    if (error instanceof Error && error.message === 'Linked account not found') {
      return errorResponse(error.message, 404);
    }

    return errorResponse('Failed to create budget item', 500);
  }
}