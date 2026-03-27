import { prisma } from '@/lib/prisma';

export interface HealthScoreResult {
  score: number;
  tier: string;
  tierTitle: string;
  tierEmoji: string;
  components: {
    budget: number;
    savings: number;
    emergency: number;
    debt: number;
    consistency: number;
  };
  trend: 'up' | 'down' | 'stable' | null;
}

interface TierInfo {
  tier: string;
  title: string;
  emoji: string;
}

function getTier(score: number): TierInfo {
  if (score >= 90) return { tier: 'EXCELLENT', title: 'Financial Rockstar', emoji: '💎' };
  if (score >= 70) return { tier: 'GOOD', title: 'On The Right Track', emoji: '🟢' };
  if (score >= 50) return { tier: 'FAIR', title: 'Room to Grow', emoji: '🟡' };
  if (score >= 30) return { tier: 'NEEDS_WORK', title: 'Building Foundations', emoji: '🟠' };
  return { tier: 'CRITICAL', title: "Let's Start Your Journey", emoji: '🔴' };
}

export async function calculateHealthScore(userId: string): Promise<HealthScoreResult> {
  const now = new Date();
  const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const endOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0);
  const daysInMonth = endOfMonth.getUTCDate();
  const currentDay = now.getUTCDate();

  // Parallel queries
  const [
    expenses,
    categoryBudgets,
    incomeRecords,
    savingsGoals,
    expenseDays,
  ] = await Promise.all([
    prisma.expense.aggregate({
      where: { userId, date: { gte: startOfMonth, lte: now } },
      _sum: { amount: true },
    }),
    prisma.categoryBudget.findMany({
      where: { userId },
      select: { monthlyLimit: true },
    }),
    prisma.incomeRecord.aggregate({
      where: {
        userId,
        status: 'RECEIVED',
        actualDate: { gte: startOfMonth, lte: now },
      },
      _sum: { actualAmount: true },
    }),
    prisma.savingsGoal.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { currentBalance: true, type: true },
    }),
    prisma.expense.groupBy({
      by: ['date'],
      where: { userId, date: { gte: startOfMonth, lte: now } },
    }),
  ]);

  const totalExpenses = Number(expenses._sum.amount ?? 0);
  const totalBudget = categoryBudgets.reduce((s, b) => s + Number(b.monthlyLimit), 0);
  const totalIncome = Number(incomeRecords._sum.actualAmount ?? 0);
  const totalSavings = savingsGoals.reduce((s, g) => s + Number(g.currentBalance), 0);
  const emergencyFund = savingsGoals
    .filter((g) => g.type === 'EMERGENCY_FUND')
    .reduce((s, g) => s + Number(g.currentBalance), 0);
  const monthlyExpenses = totalExpenses || 1;
  const daysLogged = expenseDays.length;

  // Budget adherence (25%)
  const budgetScore = totalBudget > 0
    ? Math.min(100, Math.round(((totalBudget - totalExpenses) / totalBudget) * 100))
    : 50; // neutral if no budget

  // Savings rate (25%) — target 20% = 100 score
  const savingsRate = totalIncome > 0
    ? Math.min(100, Math.round(((totalSavings / totalIncome) * 100) / 20 * 100))
    : 0;

  // Emergency fund coverage (20%) — target 6 months
  const emergencyCoverage = Math.min(100, Math.round((emergencyFund / monthlyExpenses) / 6 * 100));

  // Debt-to-income (15%) — simplified: lower expenses = better
  const dtiScore = totalIncome > 0
    ? Math.min(100, Math.max(0, Math.round((1 - totalExpenses / totalIncome) * 100)))
    : 50;

  // Consistency (15%)
  const consistencyScore = Math.min(100, Math.round((daysLogged / currentDay) * 100));

  // Weighted sum
  const score = Math.max(0, Math.min(100, Math.round(
    budgetScore * 0.25 +
    savingsRate * 0.25 +
    emergencyCoverage * 0.20 +
    dtiScore * 0.15 +
    consistencyScore * 0.15
  )));

  const { tier, title, emoji } = getTier(score);

  // Store history
  await prisma.healthScoreHistory.create({
    data: {
      userId,
      score,
      tier,
      budgetScore: Math.max(0, budgetScore),
      savingsScore: Math.max(0, savingsRate),
      emergencyScore: Math.max(0, emergencyCoverage),
      debtScore: Math.max(0, dtiScore),
      consistencyScore: Math.max(0, consistencyScore),
    },
  });

  // Update GameProfile
  await prisma.gameProfile.updateMany({
    where: { userId },
    data: { financialHealthScore: score },
  });

  // Get trend
  const lastScore = await prisma.healthScoreHistory.findFirst({
    where: { userId, calculatedAt: { lt: now } },
    orderBy: { calculatedAt: 'desc' },
    skip: 1, // skip the one we just created
    select: { score: true },
  });

  let trend: 'up' | 'down' | 'stable' | null = null;
  if (lastScore) {
    if (score > lastScore.score) trend = 'up';
    else if (score < lastScore.score) trend = 'down';
    else trend = 'stable';
  }

  return {
    score,
    tier,
    tierTitle: title,
    tierEmoji: emoji,
    components: {
      budget: Math.max(0, budgetScore),
      savings: Math.max(0, savingsRate),
      emergency: Math.max(0, emergencyCoverage),
      debt: Math.max(0, dtiScore),
      consistency: Math.max(0, consistencyScore),
    },
    trend,
  };
}

export async function getHealthScoreHistory(userId: string, weeks = 12) {
  return prisma.healthScoreHistory.findMany({
    where: { userId },
    orderBy: { calculatedAt: 'desc' },
    take: weeks,
  });
}
