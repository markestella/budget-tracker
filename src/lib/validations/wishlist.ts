import { z } from 'zod';

export const createWishlistItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z.number().positive().max(99999999.99),
  imageUrl: z.string().url().max(2048).optional().nullable(),
  productUrl: z.string().url().max(2048).optional().nullable(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
});

export const updateWishlistItemSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  price: z.number().positive().max(99999999.99).optional(),
  imageUrl: z.string().url().max(2048).optional().nullable(),
  productUrl: z.string().url().max(2048).optional().nullable(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['SAVING', 'AFFORDABLE', 'PURCHASED']).optional(),
});

export const addFundsSchema = z.object({
  amount: z.number().positive().max(99999999.99),
});

export type CreateWishlistItem = z.infer<typeof createWishlistItemSchema>;
export type UpdateWishlistItem = z.infer<typeof updateWishlistItemSchema>;
export type AddFunds = z.infer<typeof addFundsSchema>;
