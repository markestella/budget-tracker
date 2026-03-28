import { NextResponse } from 'next/server';
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

  const patterns = await prisma.spendingPattern.findMany({
    where: { userId: auth.user.id },
    orderBy: { deviation: 'desc' },
    take: 20,
  });

  return jsonResponse({ patterns });
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

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const expenses = await prisma.expense.findMany({
    where: { userId: auth.user.id, date: { gte: threeMonthsAgo } },
    select: { amount: true, category: true, date: true },
  });

  if (expenses.filter((e) => e.date < currentMonthStart).length < 10) {
    return jsonResponse({ patterns: [], message: 'Need more expense history (at least 2 months) for pattern analysis' });
  }

  // Compute average by category for previous months
  const previousExpenses = expenses.filter((e) => e.date < currentMonthStart);
  const currentExpenses = expenses.filter((e) => e.date >= currentMonthStart);
  const monthsCount = Math.max(1, new Set(previousExpenses.map((e) => `${e.date.getFullYear()}-${e.date.getMonth()}`)).size);

  const prevByCategory: Record<string, number> = {};
  for (const e of previousExpenses) {
    prevByCategory[e.category] = (prevByCategory[e.category] ?? 0) + Number(e.amount);
  }
  const avgByCategory: Record<string, number> = {};
  for (const [cat, total] of Object.entries(prevByCategory)) {
    avgByCategory[cat] = total / monthsCount;
  }

  const currByCategory: Record<string, number> = {};
  for (const e of currentExpenses) {
    currByCategory[e.category] = (currByCategory[e.category] ?? 0) + Number(e.amount);
  }

  // Detect anomalies (>30% deviation)
  const anomalies: { category: string; type: 'OVERSPEND' | 'UNDERSPEND'; deviation: number; current: number; average: number }[] = [];
  const allCategories = new Set([...Object.keys(avgByCategory), ...Object.keys(currByCategory)]);

  for (const cat of allCategories) {
    const avg = avgByCategory[cat] ?? 0;
    const curr = currByCategory[cat] ?? 0;
    if (avg === 0) continue;
    const deviation = ((curr - avg) / avg) * 100;
    if (deviation > 30) {
      anomalies.push({ category: cat, type: 'OVERSPEND', deviation: Math.round(deviation), current: curr, average: avg });
    } else if (deviation < -30) {
      anomalies.push({ category: cat, type: 'UNDERSPEND', deviation: Math.round(Math.abs(deviation)), current: curr, average: avg });
    }
  }

  // Generate insights via Gemini
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Delete old patterns for this period
  await prisma.spendingPattern.deleteMany({ where: { userId: auth.user.id, period } });

  if (anomalies.length === 0) {
    return jsonResponse({ patterns: [], message: 'No significant spending anomalies detected' });
  }

  const prompt = `Analyze these spending anomalies for a personal budget user. For each, write a brief, friendly 1-sentence insight. Return JSON array with objects {category, insight}.

Anomalies:
${anomalies.map((a) => `- ${a.category}: ${a.type}, current ₱${a.current.toLocaleString()}, avg ₱${a.average.toLocaleString()}, ${a.deviation}% ${a.type === 'OVERSPEND' ? 'above' : 'below'} average`).join('\n')}

Return ONLY valid JSON array, no markdown.`;

  try {
    const response = await generateText(prompt);
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const insights: { category: string; insight: string }[] = JSON.parse(cleaned);

    const patterns = [];
    for (const anomaly of anomalies) {
      const insightMatch = insights.find((i) => i.category === anomaly.category);
      const pattern = await prisma.spendingPattern.create({
        data: {
          userId: auth.user.id,
          type: anomaly.type,
          category: anomaly.category,
          deviation: anomaly.deviation,
          insight: insightMatch?.insight ?? `Your ${anomaly.category} spending is ${anomaly.deviation}% ${anomaly.type === 'OVERSPEND' ? 'above' : 'below'} your usual average.`,
          period,
        },
      });
      patterns.push(pattern);
    }

    return jsonResponse({ patterns });
  } catch {
    // Fallback without AI insights
    const patterns = [];
    for (const anomaly of anomalies) {
      const pattern = await prisma.spendingPattern.create({
        data: {
          userId: auth.user.id,
          type: anomaly.type,
          category: anomaly.category,
          deviation: anomaly.deviation,
          insight: `Your ${anomaly.category} spending is ${anomaly.deviation}% ${anomaly.type === 'OVERSPEND' ? 'above' : 'below'} your usual average.`,
          period,
        },
      });
      patterns.push(pattern);
    }
    return jsonResponse({ patterns });
  }
}
