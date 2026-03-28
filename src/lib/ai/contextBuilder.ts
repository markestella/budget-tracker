import { prisma } from '@/lib/prisma';

export async function buildFinancialContext(userId: string): Promise<string> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [user, recentExpenses, budgets, savings, gameProfile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, preferredCurrency: true },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      select: { amount: true, category: true, merchant: true, date: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.categoryBudget.findMany({
      where: { userId },
      select: { category: true, monthlyLimit: true },
    }),
    prisma.savingsGoal.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { name: true, targetAmount: true, currentBalance: true },
    }),
    prisma.gameProfile.findUnique({
      where: { userId },
      select: { level: true, xp: true, currentStreak: true },
    }),
  ]);

  const currency = user?.preferredCurrency ?? 'PHP';
  const totalSpentThisMonth = recentExpenses
    .filter((e) => e.date >= monthStart)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const categorySpending: Record<string, number> = {};
  for (const exp of recentExpenses.filter((e) => e.date >= monthStart)) {
    categorySpending[exp.category] = (categorySpending[exp.category] ?? 0) + Number(exp.amount);
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  const remaining = totalBudget - totalSpentThisMonth;

  const lines = [
    `You are MoneyQuest AI — a friendly, encouraging financial assistant. Use ${currency} currency (₱). Be concise and helpful.`,
    ``,
    `User: ${user?.name ?? 'User'}`,
    gameProfile ? `Level: ${gameProfile.level}, XP: ${gameProfile.xp}, Streak: ${gameProfile.currentStreak} days` : '',
    ``,
    `This month's finances:`,
    `- Total budget: ₱${totalBudget.toLocaleString()}`,
    `- Spent so far: ₱${totalSpentThisMonth.toLocaleString()}`,
    `- Remaining: ₱${remaining.toLocaleString()}`,
    ``,
    `Category spending this month:`,
    ...Object.entries(categorySpending).map(([cat, amt]) => {
      const budget = budgets.find((b) => b.category === cat);
      const budgetAmt = budget ? Number(budget.monthlyLimit) : 0;
      return `- ${cat}: ₱${amt.toLocaleString()} spent${budgetAmt > 0 ? ` / ₱${budgetAmt.toLocaleString()} budget` : ''}`;
    }),
    ``,
    savings.length > 0 ? `Savings goals:` : '',
    ...savings.map((s) => `- ${s.name}: ₱${Number(s.currentBalance).toLocaleString()}${s.targetAmount ? ` / ₱${Number(s.targetAmount).toLocaleString()}` : ''}`),
  ];

  return lines.filter(Boolean).join('\n');
}
