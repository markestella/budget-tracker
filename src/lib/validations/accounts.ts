import { AccountStatus, FinancialAccountType } from '@prisma/client';
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

const requiredNumberSchema = z.preprocess(
  preprocessNumber,
  z.number().refine(validNumber, { message: 'Value must be a valid number' }),
);

const optionalNumberSchema = z.preprocess(
  preprocessNumber,
  z.number().refine(validNumber, { message: 'Value must be a valid number' }).optional(),
);

const optionalDateStringSchema = z.preprocess(
  preprocessOptionalValue,
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Date must be a valid ISO-compatible date string' })
    .optional(),
);

const optionalExpiryDateSchema = z.preprocess(
  preprocessOptionalValue,
  z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry date must use MM/YY format' }).optional(),
);

export const financialAccountSchema = z.object({
  accountName: z.string().trim().min(1).max(120),
  accountNumber: z.preprocess(preprocessOptionalValue, z.string().trim().max(50).optional()),
  accountType: z.nativeEnum(FinancialAccountType),
  bankName: z.string().trim().min(1).max(120),
  creditLimit: optionalNumberSchema,
  currentBalance: requiredNumberSchema,
  cutoffDate: z.preprocess(preprocessNumber, z.number().int().min(1).max(31).optional()),
  expiryDate: optionalExpiryDateSchema,
  interestRate: optionalNumberSchema,
  minimumPaymentDue: optionalNumberSchema,
  paymentDueDate: optionalDateStringSchema,
  status: z.nativeEnum(AccountStatus).optional(),
});

export const financialAccountUpdateSchema = financialAccountSchema;