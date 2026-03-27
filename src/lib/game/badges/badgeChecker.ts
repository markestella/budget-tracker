import { prisma } from '@/lib/prisma';
import { awardXP } from '../xpService';
import { BADGE_DEFINITIONS } from './badgeDefinitions';

export type GameEvent =
  | 'EXPENSE_LOGGED'
  | 'BUDGET_UNDER'
  | 'SAVINGS_UPDATED'
  | 'STREAK_MILESTONE'
  | 'LEVEL_UP'
  | 'QUEST_COMPLETED'
  | 'FIRST_SETUP'
  | 'ACCOUNT_LINKED'
  | 'PAGE_VISITED'
  | 'DAILY_CHECK'
  | 'STREAK_FREEZE_USED';

export interface EarnedBadge {
  key: string;
  name: string;
  icon: string;
  xpReward: number;
}

async function isAlreadyEarned(userId: string, badgeKey: string): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { key: badgeKey } });
  if (!badge) return true; // Not seeded yet -> skip
  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  return existing !== null;
}

async function awardBadge(userId: string, badgeKey: string, xpReward: number): Promise<void> {
  const badge = await prisma.badge.findUnique({ where: { key: badgeKey } });
  if (!badge) return;

  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });

  await prisma.gameProfile.update({
    where: { userId },
    data: { totalBadges: { increment: 1 } },
  });

  if (xpReward > 0) {
    await awardXP(userId, 'EARN_BADGE', xpReward);
  }
}

// ─── Condition checkers ─────────────────────────────────

async function checkExpenseCount(userId: string, threshold: number): Promise<boolean> {
  const count = await prisma.expense.count({ where: { userId } });
  return count >= threshold;
}

async function checkStreakMilestone(userId: string, milestone: number): Promise<boolean> {
  const profile = await prisma.gameProfile.findUnique({ where: { userId } });
  return (profile?.currentStreak ?? 0) >= milestone;
}

async function checkTotalSavings(userId: string, threshold: number): Promise<boolean> {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId, status: 'ACTIVE' },
    select: { currentBalance: true },
  });
  const total = goals.reduce((sum, g) => sum + Number(g.currentBalance), 0);
  return total >= threshold;
}

async function checkLevel(userId: string, targetLevel: number): Promise<boolean> {
  const profile = await prisma.gameProfile.findUnique({ where: { userId } });
  return (profile?.level ?? 1) >= targetLevel;
}

async function checkCompletedQuests(userId: string, count: number): Promise<boolean> {
  const completed = await prisma.userQuest.count({
    where: { userId, status: 'COMPLETED' },
  });
  return completed >= count;
}

async function checkActiveSavingsGoals(userId: string, count: number): Promise<boolean> {
  const active = await prisma.savingsGoal.count({ where: { userId, status: 'ACTIVE' } });
  return active >= count;
}

const BADGE_CONDITIONS: Record<string, (userId: string) => Promise<boolean>> = {
  // Starter
  first_step: (uid) => checkExpenseCount(uid, 1),
  data_driven: (uid) => checkExpenseCount(uid, 10),
  twenty_entries: (uid) => checkExpenseCount(uid, 20),
  fifty_entries: (uid) => checkExpenseCount(uid, 50),
  centurion: (uid) => checkExpenseCount(uid, 100),
  first_save: async (uid) => {
    const count = await prisma.savingsGoal.count({ where: { userId: uid } });
    return count >= 1;
  },

  // Savings thresholds
  penny_pincher: (uid) => checkTotalSavings(uid, 1000),
  savings_starter: (uid) => checkTotalSavings(uid, 5000),
  nest_egg: (uid) => checkTotalSavings(uid, 10000),
  wealth_builder: (uid) => checkTotalSavings(uid, 50000),
  first_10k: (uid) => checkTotalSavings(uid, 10000),
  '50k_club': (uid) => checkTotalSavings(uid, 50000),
  '100k_club': (uid) => checkTotalSavings(uid, 100000),
  half_millionaire: (uid) => checkTotalSavings(uid, 500000),
  millionaire: (uid) => checkTotalSavings(uid, 1000000),

  // Discipline / Streak
  habit_forming: (uid) => checkStreakMilestone(uid, 3),
  on_fire: (uid) => checkStreakMilestone(uid, 7),
  two_week_warrior: (uid) => checkStreakMilestone(uid, 14),
  lightning: (uid) => checkStreakMilestone(uid, 30),
  consistency_king: (uid) => checkStreakMilestone(uid, 30),
  sixty_day_legend: (uid) => checkStreakMilestone(uid, 60),
  supernova: (uid) => checkStreakMilestone(uid, 90),
  half_year_hero: (uid) => checkStreakMilestone(uid, 180),
  diamond_hands: (uid) => checkStreakMilestone(uid, 365),

  // Level milestones
  level_5: (uid) => checkLevel(uid, 5),
  level_10: (uid) => checkLevel(uid, 10),
  level_25: (uid) => checkLevel(uid, 25),
  level_50: (uid) => checkLevel(uid, 50),

  // Quest milestones
  quest_novice: (uid) => checkCompletedQuests(uid, 5),
  quest_veteran: (uid) => checkCompletedQuests(uid, 25),
  quest_master: (uid) => checkCompletedQuests(uid, 100),

  // Special
  diversified: (uid) => checkActiveSavingsGoals(uid, 3),
};

export async function checkBadges(userId: string, event: GameEvent): Promise<EarnedBadge[]> {
  const relevantBadges = BADGE_DEFINITIONS.filter((b) => b.event === event);
  const earned: EarnedBadge[] = [];

  for (const badge of relevantBadges) {
    const condition = BADGE_CONDITIONS[badge.key];
    if (!condition) continue;

    const alreadyOwned = await isAlreadyEarned(userId, badge.key);
    if (alreadyOwned) continue;

    const met = await condition(userId);
    if (!met) continue;

    await awardBadge(userId, badge.key, badge.xpReward);
    earned.push({
      key: badge.key,
      name: badge.name,
      icon: badge.icon,
      xpReward: badge.xpReward,
    });
  }

  return earned;
}
