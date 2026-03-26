export interface NotificationPreferenceRecord {
  achievementAlerts: boolean;
  billReminders: boolean;
  budgetWarnings: boolean;
  challengeDeadlines: boolean;
  dailyTips: boolean;
  streakWarnings: boolean;
  userId: string;
  weeklySummary: boolean;
}

export interface PushSubscriptionPayload {
  auth: string;
  endpoint: string;
  p256dh: string;
}

export interface NotificationPayload {
  body: string;
  icon?: string;
  tag?: string;
  title: string;
  url?: string;
}

export interface NotificationSendPayload extends NotificationPayload {
  test?: boolean;
  userId?: string;
  userIds?: string[];
}
