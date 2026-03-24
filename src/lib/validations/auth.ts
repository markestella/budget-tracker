import { z } from 'zod';

const optionalNameSchema = z
  .union([z.string().trim().min(1).max(100), z.literal('')])
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value.trim();
  });

export const registerSchema = z.object({
  email: z.string().trim().email(),
  name: optionalNameSchema,
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});