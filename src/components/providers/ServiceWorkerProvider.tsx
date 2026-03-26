'use client';

import { useEffect } from 'react';

const OFFLINE_SYNC_TAG = 'moneyquest-offline-mutations';

type SyncCapableRegistration = ServiceWorkerRegistration & {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
};

export function ServiceWorkerProvider() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let isMounted = true;

    async function registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        }) as SyncCapableRegistration;

        if (registration.sync) {
          await registration.sync.register(OFFLINE_SYNC_TAG).catch(() => undefined);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to register service worker', error);
        }
      }
    }

    function handleMessage(event: MessageEvent<{ type?: string; tag?: string }>) {
      if (!isMounted || event.data?.type !== 'OFFLINE_SYNC_REQUEST') {
        return;
      }

      window.dispatchEvent(
        new CustomEvent('moneyquest:offline-sync-request', {
          detail: event.data,
        })
      );
    }

    registerServiceWorker();
    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}
