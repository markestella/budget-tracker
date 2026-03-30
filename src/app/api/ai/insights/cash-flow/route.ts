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

  if (!isGeminiConfigured()) {
    return errorResponse('AI features are not configured', 503);
  }

  const allowed = await checkRateLimit(auth.user.id);
  if (!allowed) {
    return errorResponse('Please wait before making more AI requests', 429);
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();

  const [expenses, income, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: auth.user.id, date: { gte: monthStart } },
      select: { amount: true, date: true },
      orderBy: { date: 'asc' },
    }),
    prisma.incomeRecord.findMany({
      where: { userId: auth.user.id, expectedDate: { gte: monthStart }, status: { not: 'PENDING' } },
      select: { actualAmount: true, expectedDate: true },
    }),
    prisma.categoryBudget.findMany({
      where: { userId: auth.user.id },
      select: { monthlyLimit: true },
    }),
  ]);

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  const totalIncome = income.reduce((sum, i) => sum + Number(i.actualAmount ?? 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const dailySpendRate = currentDay > 0 ? totalSpent / currentDay : 0;
  const remaining = Math.max(totalBudget, totalIncome) - totalSpent;

  // Project daily balances
  const dailyBalances: { day: number; date: string; projectedBalance: number; isProjected: boolean }[] = [];
  let runningBalance = remaining;
  let projectedZeroDate: string | null = null;

  for (let day = currentDay + 1; day <= daysInMonth; day++) {
    runningBalance -= dailySpendRate;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dailyBalances.push({
      day,
      date: dateStr,
      projectedBalance: Math.round(runningBalance),
      isProjected: true,
    });
    if (runningBalance <= 0 && !projectedZeroDate) {
      projectedZeroDate = dateStr;
    }
  }

  // Add past days with actual data
  const pastDays: typeof dailyBalances = [];
  let pastBalance = Math.max(totalBudget, totalIncome);
  const expenseByDay: Record<number, number> = {};
  for (const e of expenses) {
    const d = new Date(e.date).getDate();
    expenseByDay[d] = (expenseByDay[d] ?? 0) + Number(e.amount);
  }
  for (let day = 1; day <= currentDay; day++) {
    pastBalance -= expenseByDay[day] ?? 0;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    pastDays.push({ day, date: dateStr, projectedBalance: Math.round(pastBalance), isProjected: false });
  }

  const allDays = [...pastDays, ...dailyBalances];

  // Generate AI summary
  let summary = '';
  try {
    const prompt = `Based on this cash flow data, write a brief 2-sentence financial outlook:
- Monthly budget/income: ₱${Math.max(totalBudget, totalIncome).toLocaleString()}
- Spent so far (day ${currentDay}): ₱${totalSpent.toLocaleString()}
- Daily spending rate: ₱${Math.round(dailySpendRate).toLocaleString()}
- Remaining: ₱${Math.round(remaining).toLocaleString()}
- Days left: ${daysInMonth - currentDay}
${projectedZeroDate ? `- Projected to run out on: ${projectedZeroDate}` : '- On track to finish with surplus'}

Be friendly, concise. Use ₱ currency.`;

    summary = await generateText(prompt);
  } catch {
    summary = remaining > 0
      ? `You have ₱${Math.round(remaining).toLocaleString()} remaining this month with ${daysInMonth - currentDay} days left.`
      : `You've exceeded your budget by ₱${Math.round(Math.abs(remaining)).toLocaleString()}.`;
  }

  return jsonResponse({
    dailyBalances: allDays,
    projectedZeroDate,
    summary,
    stats: {
      totalBudget: Math.max(totalBudget, totalIncome),
      totalSpent,
      remaining: Math.round(remaining),
      dailySpendRate: Math.round(dailySpendRate),
      daysRemaining: daysInMonth - currentDay,
    },
  });
}
