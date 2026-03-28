import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { budgetSuggestionApplySchema } from '@/lib/validations/ai';
import { NextRequest } from 'next/server';
import { BudgetCategory } from '@prisma/client';

export async function POST(request: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const premiumBlock = await checkPremium(auth.user.id);
  if (premiumBlock) return premiumBlock;

  const body = await request.json();
  const validation = validateRequest(budgetSuggestionApplySchema, body);
  if ('error' in validation) return validation.error;

  const suggestion = await prisma.budgetSuggestion.findFirst({
    where: { id: validation.data.suggestionId, userId: auth.user.id, status: 'PENDING' },
  });

  if (!suggestion) {
    return errorResponse('Suggestion not found or already applied', 404);
  }

  // Update the category budget
  await prisma.categoryBudget.updateMany({
    where: { userId: auth.user.id, category: suggestion.category as BudgetCategory },
    data: { monthlyLimit: suggestion.suggestedAmount },
  });

  // Mark suggestion as applied
  await prisma.budgetSuggestion.update({
    where: { id: suggestion.id },
    data: { status: 'APPLIED' },
  });

  return jsonResponse({ success: true, applied: suggestion });
}
