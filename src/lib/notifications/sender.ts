import webpush from 'web-push';

import { prisma } from '@/lib/prisma';
import type { NotificationPayload } from '@/types/notifications';

let vapidConfigured = false;

function ensureVapidConfiguration() {
  if (vapidConfigured) {
    return;
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error('VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT must be configured');
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

async function removeInvalidSubscription(id: string) {
  await prisma.pushSubscription.delete({
    where: { id },
  }).catch(() => undefined);
}

export async function sendPushNotification(userId: string, notification: NotificationPayload) {
  ensureVapidConfiguration();

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
    select: {
      auth: true,
      endpoint: true,
      id: true,
      p256dh: true,
    },
  });

  if (subscriptions.length === 0) {
    return {
      delivered: 0,
      failed: 0,
      subscriptions: 0,
    };
  }

  let delivered = 0;
  let failed = 0;
  const payload = JSON.stringify({
    body: notification.body,
    icon: notification.icon ?? '/icons/icon-192x192.svg',
    tag: notification.tag ?? 'moneyquest-notification',
    title: notification.title,
    url: notification.url ?? '/dashboard',
  });

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
          },
        },
        payload
      );
      delivered += 1;
    } catch (error) {
      failed += 1;
      const statusCode = typeof error === 'object' && error && 'statusCode' in error
        ? Number(error.statusCode)
        : undefined;

      if (statusCode === 404 || statusCode === 410) {
        await removeInvalidSubscription(subscription.id);
      }
    }
  }));

  return {
    delivered,
    failed,
    subscriptions: subscriptions.length,
  };
}

export async function sendBulkNotifications(userIds: string[], notification: NotificationPayload) {
  const uniqueUserIds = [...new Set(userIds)];
  const results = await Promise.all(uniqueUserIds.map((userId) => sendPushNotification(userId, notification)));

  return results.reduce<{
    delivered: number;
    failed: number;
    subscriptions: number;
    users: number;
  }>(
    (summary, result) => ({
      delivered: summary.delivered + result.delivered,
      failed: summary.failed + result.failed,
      subscriptions: summary.subscriptions + result.subscriptions,
      users: summary.users + 1,
    }),
    {
      delivered: 0,
      failed: 0,
      subscriptions: 0,
      users: 0,
    }
  );
}
