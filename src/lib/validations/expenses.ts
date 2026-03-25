import { BudgetCategory } from '@prisma/client';
import { z } from 'zod';

import { parseCategorySearchParams } from '@/lib/budgets';

const preprocessOptionalValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return value;
};

const preprocessNumber = (value: unknown) => {
  const normalized = preprocessOptionalValue(value);

  if (typeof normalized === 'string') {
    return Number(normalized);
  }

  return normalized;
};

const validNumber = (value: number) => Number.isFinite(value);

const amountSchema = z.preprocess(
  preprocessNumber,
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).positive({
    message: 'Amount must be greater than 0',
  }),
);

const optionalAmountSchema = z.preprocess(
  preprocessNumber,
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).positive({
    message: 'Amount must be greater than 0',
  }).optional(),
);

const optionalDateStringSchema = z.preprocess(
  preprocessOptionalValue,
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Date must be a valid ISO-compatible date string',
  }).optional(),
);

const optionalIdSchema = z.preprocess(
  preprocessOptionalValue,
  z.string().trim().min(1).optional(),
);

const nullableIdSchema = z.preprocess((value) => {
  if (value === '' || value === undefined) {
    return null;
  }

  return value;
}, z.string().trim().min(1).nullable().optional());

export const expensePayloadSchema = z.object({
  amount: amountSchema,
  category: z.nativeEnum(BudgetCategory),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Date must be a valid ISO-compatible date string',
  }),
  isRecurring: z.boolean().optional(),
  linkedAccountId: optionalIdSchema,
  linkedBudgetItemId: optionalIdSchema,
  merchant: z.string().trim().min(1).max(120),
  notes: z.preprocess(preprocessOptionalValue, z.string().trim().max(280).optional()),
});

export const expenseUpdateSchema = z.object({
  amount: optionalAmountSchema,
  category: z.nativeEnum(BudgetCategory).optional(),
  date: optionalDateStringSchema,
  isRecurring: z.boolean().optional(),
  linkedAccountId: nullableIdSchema,
  linkedBudgetItemId: nullableIdSchema,
  merchant: z.preprocess(preprocessOptionalValue, z.string().trim().min(1).max(120).optional()),
  notes: z.preprocess(preprocessOptionalValue, z.string().trim().max(280).optional()),
}).superRefine((value, context) => {
  if (Object.keys(value).length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one field is required to update an expense',
    });
  }
});

export const expenseListQuerySchema = z.object({
  accountId: optionalIdSchema,
  category: z.array(z.nativeEnum(BudgetCategory)).default([]),
  endDate: optionalDateStringSchema,
  maxAmount: optionalAmountSchema,
  minAmount: optionalAmountSchema,
  page: z.preprocess(preprocessNumber, z.number().int().min(1).default(1)),
  pageSize: z.preprocess(preprocessNumber, z.number().int().min(1).max(100).default(20)),
  search: z.preprocess(preprocessOptionalValue, z.string().trim().max(160).optional()),
  startDate: optionalDateStringSchema,
}).superRefine((value, context) => {
  if (value.startDate && value.endDate && new Date(value.startDate) > new Date(value.endDate)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Start date must be before or equal to end date',
      path: ['startDate'],
    });
  }

  if (value.minAmount !== undefined && value.maxAmount !== undefined && value.minAmount > value.maxAmount) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Minimum amount must be less than or equal to maximum amount',
      path: ['minAmount'],
    });
  }
});

export function parseExpenseListParams(searchParams: URLSearchParams) {
  const parsedCategories = parseCategorySearchParams(searchParams.getAll('category'));

  return expenseListQuerySchema.parse({
    accountId: searchParams.get('accountId') ?? undefined,
    category: parsedCategories,
    endDate: searchParams.get('endDate') ?? undefined,
    maxAmount: searchParams.get('maxAmount') ?? undefined,
    minAmount: searchParams.get('minAmount') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    startDate: searchParams.get('startDate') ?? undefined,
  });
}