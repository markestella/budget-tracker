import {
  IncomeCategory,
  PaymentFrequency,
  PaymentStatus,
  ScheduleWeek,
} from '@prisma/client';
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
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).positive({ message: 'Amount must be greater than 0' }),
);

const optionalAmountSchema = z.preprocess(
  preprocessNumber,
  z.number().refine(validNumber, { message: 'Amount must be a valid number' }).positive({ message: 'Amount must be greater than 0' }).optional(),
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

const optionalTimeSchema = z.preprocess(
  preprocessOptionalValue,
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must use HH:MM format' }).optional(),
);

const optionalScheduleDayAmountsSchema = z.preprocess(
  preprocessOptionalValue,
  z.record(z.string(), amountSchema).optional(),
);

export const incomeSourceSchema = z
  .object({
    amount: amountSchema,
    category: z.nativeEnum(IncomeCategory),
    description: z.preprocess(preprocessOptionalValue, z.string().trim().max(500).optional()),
    frequency: z.nativeEnum(PaymentFrequency),
    isActive: z.boolean().optional(),
    name: z.string().trim().min(1).max(120),
    scheduleDayAmounts: optionalScheduleDayAmountsSchema,
    scheduleDays: z.preprocess(preprocessOptionalValue, z.array(z.number().int().min(1).max(31)).optional()),
    scheduleTime: optionalTimeSchema,
    scheduleWeek: z.preprocess(preprocessOptionalValue, z.nativeEnum(ScheduleWeek).optional()),
    scheduleWeekday: z.preprocess(preprocessNumber, z.number().int().min(0).max(6).optional()),
    useManualAmounts: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.frequency === PaymentFrequency.MONTHLY && (!value.scheduleDays || value.scheduleDays.length === 0)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Monthly payments require at least one scheduled day',
        path: ['scheduleDays'],
      });
    }

    if (
      (value.frequency === PaymentFrequency.WEEKLY || value.frequency === PaymentFrequency.BIWEEKLY) &&
      value.scheduleWeekday === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Weekly and bi-weekly payments require a scheduled weekday',
        path: ['scheduleWeekday'],
      });
    }

    if (value.frequency === PaymentFrequency.BIWEEKLY && value.scheduleWeek === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bi-weekly payments require a scheduled week of the month',
        path: ['scheduleWeek'],
      });
    }
  });

const incomeRecordBaseSchema = z.object({
  actualAmount: optionalAmountSchema,
  actualDate: optionalDateStringSchema,
  expectedDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Expected date must be a valid ISO-compatible date string',
  }),
  incomeSourceId: z.string().trim().min(1),
  notes: z.preprocess(preprocessOptionalValue, z.string().trim().max(1000).optional()),
  status: z.nativeEnum(PaymentStatus).optional(),
});

export const incomeRecordSchema = incomeRecordBaseSchema
  .superRefine((value, context) => {
    if (value.status === PaymentStatus.RECEIVED && value.actualAmount === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Actual amount is required when status is RECEIVED',
        path: ['actualAmount'],
      });
    }
  });

export const incomeRecordUpdateSchema = incomeRecordBaseSchema
  .omit({ incomeSourceId: true })
  .partial()
  .superRefine((value, context) => {
    if (Object.keys(value).length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field is required to update an income record',
      });
    }

    if (value.status === PaymentStatus.RECEIVED && value.actualAmount === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Actual amount is required when status is RECEIVED',
        path: ['actualAmount'],
      });
    }
  });

export const generatePaymentsSchema = z.object({
  action: z.enum(['generate', 'cleanup', 'cleanup-invalid', 'update-dates']).default('generate'),
  daysAhead: z.preprocess(preprocessNumber, z.number().int().min(1).max(365).optional()),
});

export const incomeSourceUpdateSchema = incomeSourceSchema;

export const paymentLookupSchema = z.object({
  daysAhead: optionalNumberSchema,
});