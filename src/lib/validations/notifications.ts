import { z } from 'zod';

const optionalBoolean = z.boolean().optional();

export const pushSubscriptionSchema = z.object({
  auth: z.string().trim().min(1),
  endpoint: z.string().trim().url(),
  p256dh: z.string().trim().min(1),
});

export const unsubscribeSchema = z.object({
  endpoint: z.string().trim().url(),
});

export const notificationPreferencesSchema = z.object({
  achievementAlerts: optionalBoolean,
  billReminders: optionalBoolean,
  budgetWarnings: optionalBoolean,
  challengeDeadlines: optionalBoolean,
  dailyTips: optionalBoolean,
  streakWarnings: optionalBoolean,
  weeklySummary: optionalBoolean,
});

export const notificationSendSchema = z.object({
  body: z.string().trim().min(1).max(240),
  icon: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).max(80).optional(),
  test: z.boolean().optional(),
  title: z.string().trim().min(1).max(120),
  url: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  userIds: z.array(z.string().trim().min(1)).max(100).optional(),
}).superRefine((value, context) => {
  if (!value.test && !value.userId && (!value.userIds || value.userIds.length === 0)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide userId or userIds for non-test notifications',
      path: ['userId'],
    });
  }
});

export const cronQuerySchema = z.object({
  job: z.enum(['daily', 'weekly']).default('daily'),
});
