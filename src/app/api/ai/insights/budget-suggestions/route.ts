import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { checkRateLimit, generateText, isGeminiConfigured } from '@/lib/ai/geminiService';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

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

Valid categories: ${Object.entries(avgSpending).map(([cat]) => cat).join(', ')}

For each category, suggest an optimized budget amount with reasoning. Use ONLY the exact category names listed above. Return a JSON array with objects: {"category": string, "currentAmount": number, "suggestedAmount": number, "reasoning": string, "estimatedSavings": number}. Return ONLY the raw JSON array — no markdown, no code fences, no extra text.`;

  try {
    const response = await generateText(prompt);
    // Strip any markdown fences and find the JSON array
    let cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    // Find the first [ and last ] to extract just the JSON array
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1) {
      return errorResponse('Failed to parse AI response', 503);
    }
    cleaned = cleaned.slice(startIdx, endIdx + 1);

    const parsed: { category: string; currentAmount: number; suggestedAmount: number; reasoning: string; estimatedSavings: number }[] = JSON.parse(cleaned);

    // Validate each suggestion has required fields and valid category
    const validCategories = new Set(Object.keys(avgSpending));
    const validSuggestions = parsed.filter(
      (s) =>
        typeof s.category === 'string' &&
        typeof s.suggestedAmount === 'number' &&
        typeof s.reasoning === 'string' &&
        validCategories.has(s.category)
    );

    if (validSuggestions.length === 0) {
      return errorResponse('No valid suggestions could be generated', 503);
    }

    // Clear old pending suggestions
    await prisma.budgetSuggestion.deleteMany({ where: { userId: auth.user.id, status: 'PENDING' } });

    const suggestions = [];
    for (const s of validSuggestions) {
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
  } catch (err) {
    console.error('Budget suggestions generation failed:', err);
    return errorResponse('Failed to generate budget suggestions', 503);
  }
}
