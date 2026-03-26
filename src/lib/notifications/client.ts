import type { PushSubscriptionPayload } from '@/types/notifications';

function toUint8Array(base64String: string) {
  const normalized = `${base64String}${'='.repeat((4 - (base64String.length % 4)) % 4)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(normalized);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

export function isPushNotificationSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'PushManager' in window &&
    'serviceWorker' in navigator
  );
}

export async function getBrowserPushSubscription() {
  if (!isPushNotificationSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeCurrentBrowser(): Promise<PushSubscriptionPayload> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured');
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription = existingSubscription ?? await registration.pushManager.subscribe({
    applicationServerKey: toUint8Array(vapidPublicKey),
    userVisibleOnly: true,
  });
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Push subscription keys are incomplete');
  }

  return {
    auth: json.keys.auth,
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
  };
}

export async function unsubscribeCurrentBrowser() {
  const subscription = await getBrowserPushSubscription();

  if (!subscription) {
    return null;
  }

  await subscription.unsubscribe();
  return subscription.endpoint;
}
