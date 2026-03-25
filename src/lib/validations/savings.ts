import { SavingsGoalStatus, SavingsGoalType, SavingsTransactionType } from '@prisma/client';
import { z } from 'zod';

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
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).nonnegative({
    message: 'Amount must be zero or greater',
  }),
);

const optionalAmountSchema = z.preprocess(
  preprocessNumber,
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).nonnegative({
    message: 'Amount must be zero or greater',
  }).optional(),
);

const requiredDateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Date must be a valid ISO-compatible date string',
});

const optionalDateSchema = z.preprocess(
  preprocessOptionalValue,
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Date must be a valid ISO-compatible date string',
  }).optional(),
);

export const savingsGoalSchema = z.object({
  currentBalance: amountSchema,
  institution: z.string().trim().min(1).max(120),
  interestRate: optionalAmountSchema,
  lastUpdatedBalance: optionalDateSchema,
  monthlyContribution: amountSchema,
  name: z.string().trim().min(1).max(120),
  notes: z.preprocess(preprocessOptionalValue, z.string().trim().max(500).optional()),
  startDate: requiredDateSchema,
  status: z.nativeEnum(SavingsGoalStatus).optional(),
  targetAmount: optionalAmountSchema,
  type: z.nativeEnum(SavingsGoalType),
});

export const savingsGoalUpdateSchema = savingsGoalSchema.partial().superRefine((value, context) => {
  if (Object.keys(value).length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one field is required to update a savings goal',
    });
  }
});

export const savingsTransactionSchema = z.object({
  amount: z.preprocess(
    preprocessNumber,
    z.number().refine(validNumber, { message: 'Amount must be a valid number' }).positive({
      message: 'Amount must be greater than 0',
    }),
  ),
  date: requiredDateSchema,
  notes: z.preprocess(preprocessOptionalValue, z.string().trim().max(280).optional()),
  type: z.nativeEnum(SavingsTransactionType),
});