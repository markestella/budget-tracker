import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { checkRateLimit, generateText, isGeminiConfigured } from '@/lib/ai/geminiService';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { budgetSuggestionApplySchema } from '@/lib/validations/ai';

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const premiumBlock = await checkPremium(auth.user.id);
  if (premiumBlock) return premiumBlock;

  const suggestions = await prisma.budgetSuggestion.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return jsonResponse({ suggestions });
}

export async function POST() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const premiumBlock = await checkPremium(auth.user.id);
  if (premiumBlock) return premiumBlock;

  if (!isGeminiConfigured()) {
    return errorResponse('AI features are not configured', 503);
  }

  const allowed = await checkRateLimit(auth.user.id);
  if (!allowed) {
    return errorResponse('Please wait before making more AI requests', 429);
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [expenses, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: auth.user.id, date: { gte: threeMonthsAgo } },
      select: { amount: true, category: true },
    }),
    prisma.categoryBudget.findMany({
      where: { userId: auth.user.id },
      select: { category: true, monthlyLimit: true },
    }),
  ]);

  if (expenses.length < 30) {
    return jsonResponse({ suggestions: [], message: 'Need at least 3 months of expense data for budget suggestions' });
  }

  const spendingByCategory: Record<string, number[]> = {};
  for (const e of expenses) {
    if (!spendingByCategory[e.category]) spendingByCategory[e.category] = [];
    spendingByCategory[e.category].push(Number(e.amount));
  }

  const avgSpending: Record<string, number> = {};
  for (const [cat, amounts] of Object.entries(spendingByCategory)) {
    avgSpending[cat] = amounts.reduce((a, b) => a + b, 0) / 3;
  }

  const budgetMap: Record<string, number> = {};
  for (const b of budgets) {
    budgetMap[b.category] = Number(b.monthlyLimit);
  }

  const prompt = `You are a budget optimization expert. Analyze this spending data and suggest optimized monthly budget allocations.

Current budgets and average monthly spending (₱):
${Object.entries(avgSpending)
  .map(([cat, avg]) => `- ${cat}: budget ₱${(budgetMap[cat] ?? 0).toLocaleString()}, avg spending ₱${Math.round(avg).toLocaleString()}`)
  .join('\n')}

For each category, suggest an optimized budget amount with reasoning. Return JSON array with objects: {category, currentAmount, suggestedAmount, reasoning, estimatedSavings}. Return ONLY valid JSON array, no markdown.`;

  try {
    const response = await generateText(prompt);
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed: { category: string; currentAmount: number; suggestedAmount: number; reasoning: string; estimatedSavings: number }[] = JSON.parse(cleaned);

    // Clear old pending suggestions
    await prisma.budgetSuggestion.deleteMany({ where: { userId: auth.user.id, status: 'PENDING' } });

    const suggestions = [];
    for (const s of parsed) {
      const suggestion = await prisma.budgetSuggestion.create({
        data: {
          userId: auth.user.id,
          category: s.category,
          currentAmount: s.currentAmount,
          suggestedAmount: s.suggestedAmount,
          reasoning: s.reasoning,
          estimatedSavings: s.estimatedSavings,
          status: 'PENDING',
        },
      });
      suggestions.push(suggestion);
    }

    return jsonResponse({ suggestions });
  } catch {
    return errorResponse('Failed to generate budget suggestions', 503);
  }
}
