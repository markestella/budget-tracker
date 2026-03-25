import { ThemePreference } from '@prisma/client';
import { z } from 'zod';

const preprocessOptionalValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return value;
};

export const profileUpdateSchema = z.object({
  bio: z.preprocess(preprocessOptionalValue, z.string().trim().max(200).optional()),
  image: z.preprocess(preprocessOptionalValue, z.string().trim().max(200).optional()),
  name: z.string().trim().min(1).max(120),
});

export const passwordUpdateSchema = z.object({
  confirmPassword: z.string().min(8).max(120),
  currentPassword: z.string().min(8).max(120),
  newPassword: z.string().min(8).max(120),
}).superRefine((value, context) => {
  if (value.newPassword !== value.confirmPassword) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'New password and confirmation must match',
      path: ['confirmPassword'],
    });
  }
});

export const preferencesUpdateSchema = z.object({
  preferredTheme: z.nativeEnum(ThemePreference).optional(),
});

export const customCategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
});

export const exportQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
});