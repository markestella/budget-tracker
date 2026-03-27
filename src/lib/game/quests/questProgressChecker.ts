import { prisma } from '@/lib/prisma';
import { awardXP } from '../xpService';
import { checkBadges } from '../badges/badgeChecker';

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

interface QuestCondition {
  metric: string;
  operator: string;
  value: number;
}

async function evaluateMetric(userId: string, metric: string): Promise<number> {
  const now = new Date();
  const startOfDay = getStartOfDay(now);
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = getStartOfMonth(now);

  switch (metric) {
    case 'expenses_logged_today': {
      return prisma.expense.count({
        where: { userId, createdAt: { gte: startOfDay } },
      });
    }
    case 'entertainment_expenses_today': {
      return prisma.expense.count({
        where: { userId, category: 'ENTERTAINMENT', date: { gte: startOfDay } },
      });
    }
    case 'food_dining_expenses_today': {
      return prisma.expense.count({
        where: { userId, category: 'FOOD_DINING', date: { gte: startOfDay } },
      });
    }
    case 'misc_expenses_today': {
      return prisma.expense.count({
        where: { userId, category: 'MISCELLANEOUS', date: { gte: startOfDay } },
      });
    }
    case 'non_essential_expenses_today': {
      return prisma.expense.count({
        where: {
          userId,
          date: { gte: startOfDay },
          category: { in: ['ENTERTAINMENT', 'MISCELLANEOUS'] },
        },
      });
    }
    case 'total_spent_today': {
      const agg = await prisma.expense.aggregate({
        where: { userId, date: { gte: startOfDay } },
        _sum: { amount: true },
      });
      return Number(agg._sum.amount ?? 0);
    }
    case 'categories_logged_today': {
      const cats = await prisma.expense.groupBy({
        by: ['category'],
        where: { userId, date: { gte: startOfDay } },
      });
      return cats.length;
    }
    case 'expenses_with_notes_today': {
      return prisma.expense.count({
        where: { userId, createdAt: { gte: startOfDay }, notes: { not: null } },
      });
    }
    case 'linked_expenses_today': {
      return prisma.expense.count({
        where: { userId, createdAt: { gte: startOfDay }, linkedAccountId: { not: null } },
      });
    }
    case 'morning_expense_logged': {
      const noon = new Date(startOfDay);
      noon.setUTCHours(12, 0, 0, 0);
      return prisma.expense.count({
        where: { userId, createdAt: { gte: startOfDay, lt: noon } },
      });
    }

    // Weekly metrics
    case 'days_logged_this_week': {
      const days = await prisma.expense.groupBy({
        by: ['date'],
        where: { userId, date: { gte: startOfWeek } },
      });
      return days.length;
    }
    case 'expenses_this_week': {
      return prisma.expense.count({
        where: { userId, date: { gte: startOfWeek } },
      });
    }
    case 'total_spent_week': {
      const agg = await prisma.expense.aggregate({
        where: { userId, date: { gte: startOfWeek } },
        _sum: { amount: true },
      });
      return Number(agg._sum.amount ?? 0);
    }
    case 'categories_logged_week': {
      const cats = await prisma.expense.groupBy({
        by: ['category'],
        where: { userId, date: { gte: startOfWeek } },
      });
      return cats.length;
    }
    case 'misc_expenses_week': {
      return prisma.expense.count({
        where: { userId, category: 'MISCELLANEOUS', date: { gte: startOfWeek } },
      });
    }
    case 'entertainment_spent_week': {
      const agg = await prisma.expense.aggregate({
        where: { userId, category: 'ENTERTAINMENT', date: { gte: startOfWeek } },
        _sum: { amount: true },
      });
      return Number(agg._sum.amount ?? 0);
    }
    case 'savings_deposit_this_week':
    case 'emergency_deposit_this_week': {
      const txType = metric === 'emergency_deposit_this_week' ? 'EMERGENCY_FUND' : undefined;
      const count = await prisma.savingsTransaction.count({
        where: {
          userId,
          type: 'DEPOSIT',
          date: { gte: startOfWeek },
          ...(txType ? { savingsGoal: { type: txType } } : {}),
        },
      });
      return count;
    }
    case 'streak_maintained_week': {
      const profile = await prisma.gameProfile.findUnique({ where: { userId } });
      return profile?.currentStreak ?? 0;
    }

    // Monthly metrics
    case 'days_logged_month': {
      const days = await prisma.expense.groupBy({
        by: ['date'],
        where: { userId, date: { gte: startOfMonth } },
      });
      return days.length;
    }
    case 'expenses_this_month': {
      return prisma.expense.count({
        where: { userId, date: { gte: startOfMonth } },
      });
    }
    case 'zero_expense_days_month': {
      const daysWithExpenses = await prisma.expense.groupBy({
        by: ['date'],
        where: { userId, date: { gte: startOfMonth } },
      });
      const currentDay = now.getUTCDate();
      return currentDay - daysWithExpenses.length;
    }
    case 'all_categories_under_budget': {
      const budgets = await prisma.categoryBudget.findMany({ where: { userId } });
      if (budgets.length === 0) return 0;
      let allUnder = true;
      for (const b of budgets) {
        const spent = await prisma.expense.aggregate({
          where: { userId, category: b.category, date: { gte: startOfMonth } },
          _sum: { amount: true },
        });
        if (Number(spent._sum.amount ?? 0) > Number(b.monthlyLimit)) {
          allUnder = false;
          break;
        }
      }
      return allUnder ? 1 : 0;
    }

    // Engagement metrics (simplified — always return 1 as these are page-visit quests)
    case 'visited_budget_page':
    case 'visited_savings_page':
    case 'visited_dashboard':
    case 'budget_categories_reviewed':
      return 1;

    // Fallback
    default:
      return 0;
  }
}

function evaluateCondition(actual: number, condition: QuestCondition): number {
  const { operator, value } = condition;
  switch (operator) {
    case '>=':
      return actual >= value ? 100 : Math.min(99, Math.round((actual / value) * 100));
    case '==':
      return actual === value ? 100 : 0;
    case '<=':
      return actual <= value ? 100 : 0;
    case '>':
      return actual > value ? 100 : Math.min(99, Math.round((actual / Math.max(value, 1)) * 100));
    default:
      return 0;
  }
}

export async function checkQuestProgress(userId: string): Promise<{
  completed: Array<{ questId: string; title: string; xpReward: number }>;
  updated: Array<{ questId: string; progress: number }>;
}> {
  const now = new Date();

  // Expire past-due quests
  await prisma.userQuest.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
      expiresAt: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });

  // Get active quests
  const activeQuests = await prisma.userQuest.findMany({
    where: { userId, status: 'ACTIVE' },
    include: { questDefinition: true },
  });

  const completed: Array<{ questId: string; title: string; xpReward: number }> = [];
  const updated: Array<{ questId: string; progress: number }> = [];

  for (const quest of activeQuests) {
    const conditions = quest.questDefinition.conditions as unknown as QuestCondition;
    const metricValue = await evaluateMetric(userId, conditions.metric);
    const progress = evaluateCondition(metricValue, conditions);

    if (progress === 100 && quest.status === 'ACTIVE') {
      await prisma.userQuest.update({
        where: { id: quest.id },
        data: { status: 'COMPLETED', progress: 100, completedAt: now },
      });

      await awardXP(userId, 'COMPLETE_QUEST', quest.questDefinition.xpReward);
      await checkBadges(userId, 'QUEST_COMPLETED');

      completed.push({
        questId: quest.id,
        title: quest.questDefinition.title,
        xpReward: quest.questDefinition.xpReward,
      });
    } else if (progress !== quest.progress) {
      await prisma.userQuest.update({
        where: { id: quest.id },
        data: { progress },
      });
      updated.push({ questId: quest.id, progress });
    }
  }

  return { completed, updated };
}
