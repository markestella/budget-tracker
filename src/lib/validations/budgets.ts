import { BudgetCategory, BudgetItemType } from '@prisma/client';
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
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).positive({ message: 'Amount must be greater than 0' }),
);

const optionalAmountSchema = z.preprocess(
  preprocessNumber,
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).positive({ message: 'Amount must be greater than 0' }).optional(),
);

const optionalDateStringSchema = z.preprocess(
  preprocessOptionalValue,
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Date must be a valid ISO-compatible date string' })
    .optional(),
);

const optionalStringSchema = z.preprocess(
  preprocessOptionalValue,
  z.string().trim().optional(),
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

const dueDateSchema = z.preprocess(
  preprocessNumber,
  z.number().int().min(1).max(31),
);

const optionalDueDateSchema = z.preprocess(
  preprocessNumber,
  z.number().int().min(1).max(31).optional(),
);

const totalMonthsSchema = z.preprocess(
  preprocessNumber,
  z.number().int().min(1).max(600),
);

const optionalTotalMonthsSchema = z.preprocess(
  preprocessNumber,
  z.number().int().min(1).max(600).optional(),
);

const completedPaymentsSchema = z.preprocess(
  preprocessNumber,
  z.number().int().min(0).max(600).optional(),
);

const budgetItemBaseSchema = {
  amount: amountSchema,
  category: z.nativeEnum(BudgetCategory),
  description: z.string().trim().min(1).max(160),
  dueDate: dueDateSchema,
  isActive: z.boolean().optional(),
  linkedAccountId: optionalIdSchema,
  merchant: z.preprocess(preprocessOptionalValue, z.string().trim().max(120).optional()),
};

export const constantBudgetItemSchema = z.object({
  ...budgetItemBaseSchema,
  type: z.literal(BudgetItemType.CONSTANT),
});

export const durationBudgetItemSchema = z.object({
  ...budgetItemBaseSchema,
  startDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Start date must be a valid ISO-compatible date string',
  }),
  totalMonths: totalMonthsSchema,
  type: z.literal(BudgetItemType.DURATION),
});

export const budgetItemSchema = z.discriminatedUnion('type', [
  constantBudgetItemSchema,
  durationBudgetItemSchema,
]);

export const budgetItemUpdateSchema = z
  .object({
    amount: optionalAmountSchema,
    category: z.nativeEnum(BudgetCategory).optional(),
    completedPayments: completedPaymentsSchema,
    description: optionalStringSchema,
    dueDate: optionalDueDateSchema,
    isActive: z.boolean().optional(),
    linkedAccountId: nullableIdSchema,
    markPaid: z.boolean().optional(),
    merchant: optionalStringSchema,
    startDate: optionalDateStringSchema,
    totalMonths: optionalTotalMonthsSchema,
    type: z.nativeEnum(BudgetItemType).optional(),
  })
  .superRefine((value, context) => {
    if (Object.keys(value).length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field is required to update a budget item',
      });
    }
  });

export const categoryBudgetSchema = z.object({
  category: z.nativeEnum(BudgetCategory),
  monthlyLimit: amountSchema,
  rollover: z.boolean().optional(),
});

export const budgetListQuerySchema = z
  .object({
    category: z.array(z.nativeEnum(BudgetCategory)).default([]),
    endDate: optionalDateStringSchema,
    search: z.preprocess(preprocessOptionalValue, z.string().trim().max(160).optional()),
    startDate: optionalDateStringSchema,
    type: z.nativeEnum(BudgetItemType).optional(),
  })
  .superRefine((value, context) => {
    if (value.startDate && value.endDate && new Date(value.startDate) > new Date(value.endDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date must be before or equal to end date',
        path: ['startDate'],
      });
    }
  });

export function parseBudgetListParams(searchParams: URLSearchParams) {
  const parsedCategories = parseCategorySearchParams(searchParams.getAll('category'));

  return budgetListQuerySchema.parse({
    category: parsedCategories,
    endDate: searchParams.get('endDate') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    startDate: searchParams.get('startDate') ?? undefined,
    type: searchParams.get('type') ?? undefined,
  });
}