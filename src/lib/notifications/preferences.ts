import { prisma } from '@/lib/prisma';

export const defaultNotificationPreferences = {
  achievementAlerts: true,
  billReminders: true,
  budgetWarnings: true,
  challengeDeadlines: true,
  dailyTips: false,
  streakWarnings: true,
  weeklySummary: true,
} as const;

export function ensureNotificationPreferences(userId: string) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      ...defaultNotificationPreferences,
    },
  });
}
