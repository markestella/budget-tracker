'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BellRing, Send } from 'lucide-react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { NotificationsSkeleton } from './SettingsSkeleton';
import {
  getBrowserPushSubscription,
  isPushNotificationSupported,
  subscribeCurrentBrowser,
  unsubscribeCurrentBrowser,
} from '@/lib/notifications/client';
import type { NotificationPreferenceRecord, NotificationSendPayload, PushSubscriptionPayload } from '@/types/notifications';

const notificationOptions: Array<{
  description: string;
  key: keyof Omit<NotificationPreferenceRecord, 'userId'>;
  label: string;
}> = [
  { description: 'Reminders for bills due in 3 days, tomorrow, and today.', key: 'billReminders', label: 'Bill reminders' },
  { description: 'Alerts when category budgets reach 80%, 90%, and 100% usage.', key: 'budgetWarnings', label: 'Budget warnings' },
  { description: 'Celebrations for milestones and gamified achievements.', key: 'achievementAlerts', label: 'Achievement alerts' },
  { description: 'Daily nudges for coaching content.', key: 'dailyTips', label: 'Daily tips' },
  { description: 'A weekly recap of your spending, income, and savings.', key: 'weeklySummary', label: 'Weekly summary' },
  { description: 'Warnings when your activity streak is about to break.', key: 'streakWarnings', label: 'Streak warnings' },
  { description: 'Challenge deadline reminders for game loops.', key: 'challengeDeadlines', label: 'Challenge deadlines' },
];

interface NotificationsSectionProps {
  isLoading: boolean;
  notificationPreferencesQuery: UseQueryResult<NotificationPreferenceRecord, Error>;
  subscribeToNotificationsMutation: UseMutationResult<{ success: boolean }, Error, PushSubscriptionPayload>;
  unsubscribeFromNotificationsMutation: UseMutationResult<{ success: boolean }, Error, string>;
  updateNotificationPreferencesMutation: UseMutationResult<NotificationPreferenceRecord, Error, Partial<NotificationPreferenceRecord>>;
  sendTestNotificationMutation: UseMutationResult<{ success: boolean }, Error, NotificationSendPayload>;
}

export default function NotificationsSection({
  isLoading,
  notificationPreferencesQuery,
  subscribeToNotificationsMutation,
  unsubscribeFromNotificationsMutation,
  updateNotificationPreferencesMutation,
  sendTestNotificationMutation,
}: NotificationsSectionProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!isPushNotificationSupported()) {
      return () => { isActive = false; };
    }

    queueMicrotask(() => {
      if (!isActive) return;
      setNotificationsSupported(true);
      setNotificationPermission(Notification.permission);
    });

    getBrowserPushSubscription()
      .then((subscription) => {
        if (isActive) setIsSubscribed(Boolean(subscription));
      })
      .catch(() => {
        if (isActive) setIsSubscribed(false);
      });

    return () => { isActive = false; };
  }, []);

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  async function handleEnableNotifications() {
    if (!isPushNotificationSupported()) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== 'granted') {
        toast.error('Notification permission was not granted');
        return;
      }
      const subscription = await subscribeCurrentBrowser();
      await subscribeToNotificationsMutation.mutateAsync(subscription);
      setIsSubscribed(true);
      toast.success('Notifications enabled for this device');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enable notifications');
    }
  }

  async function handleDisableNotifications() {
    try {
      const endpoint = await unsubscribeCurrentBrowser();
      if (endpoint) {
        await unsubscribeFromNotificationsMutation.mutateAsync(endpoint);
      }
      setIsSubscribed(false);
      toast.success('Notifications disabled for this device');
    } catch {
      toast.error('Failed to disable notifications');
    }
  }

  async function handleNotificationPreferenceChange(
    key: keyof Omit<NotificationPreferenceRecord, 'userId'>,
    checked: boolean,
  ) {
    try {
      await updateNotificationPreferencesMutation.mutateAsync({ [key]: checked });
    } catch {
      toast.error('Failed to update notification preferences');
    }
  }

  async function handleSendTestNotification() {
    try {
      await sendTestNotificationMutation.mutateAsync({
        body: 'MoneyQuest push notifications are configured for this browser.',
        tag: 'moneyquest-test-notification',
        title: 'MoneyQuest test notification',
        url: '/dashboard/settings',
      });
      toast.success('Test notification sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send test notification');
    }
  }

  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Enable browser push, choose which alerts matter, and test delivery.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser permission */}
        <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-950 dark:text-slate-100">
                <BellRing className="size-4 text-indigo-500" />
                <p className="font-semibold">Browser notification access</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {notificationsSupported
                  ? isSubscribed
                    ? 'This browser is connected for MoneyQuest notifications.'
                    : 'Grant permission and subscribe this device to receive reminders.'
                  : 'This browser does not support the Push API.'}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Permission: {notificationPermission}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                isLoading={subscribeToNotificationsMutation.isPending}
                disabled={!notificationsSupported || isSubscribed}
                onClick={handleEnableNotifications}
              >
                Enable
              </Button>
              <Button
                size="sm"
                variant="outline"
                isLoading={unsubscribeFromNotificationsMutation.isPending}
                disabled={!isSubscribed}
                onClick={handleDisableNotifications}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>

        {/* Preference toggles */}
        <div className="space-y-3">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-950 dark:text-slate-100">{option.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{option.description}</p>
              </div>
              <Switch
                checked={notificationPreferencesQuery.data?.[option.key] ?? false}
                disabled={notificationPreferencesQuery.isLoading || updateNotificationPreferencesMutation.isPending}
                onCheckedChange={(checked) => handleNotificationPreferenceChange(option.key, checked)}
              />
            </div>
          ))}
        </div>

        {/* Test delivery */}
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-950 dark:text-slate-100">Test delivery</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send a sample push notification to this browser.</p>
          </div>
          <Button
            size="sm"
            disabled={!isSubscribed}
            isLoading={sendTestNotificationMutation.isPending}
            onClick={handleSendTestNotification}
            variant="outline"
          >
            <Send className="size-3.5" />
            Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
