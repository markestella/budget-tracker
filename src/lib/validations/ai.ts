import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

export const categorizeSchema = z.object({
  description: z.string().min(1).max(200),
});

export const receiptConfirmSchema = z.object({
  merchantName: z.string().optional(),
  totalAmount: z.number().positive(),
  date: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const budgetSuggestionApplySchema = z.object({
  suggestionId: z.string(),
});
