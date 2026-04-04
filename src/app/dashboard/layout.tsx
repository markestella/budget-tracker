'use client';

import { Suspense, useEffect, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DemoProvider } from '@/components/providers/DemoProvider';

const DEMO_STORAGE_KEY = 'demo';
const DEMO_STORAGE_EVENT = 'moneyquest-demo-change';

function readDemoPreference() {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(DEMO_STORAGE_KEY) === '1';
}

function subscribeToDemoPreference(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStoreChange = () => onStoreChange();

  window.addEventListener(DEMO_STORAGE_EVENT, handleStoreChange);
  window.addEventListener('storage', handleStoreChange);

  return () => {
    window.removeEventListener(DEMO_STORAGE_EVENT, handleStoreChange);
    window.removeEventListener('storage', handleStoreChange);
  };
}

function emitDemoPreferenceChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(DEMO_STORAGE_EVENT));
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const urlDemo = searchParams.get('demo') === 'true';
  const sessionDemo = useSyncExternalStore(
    subscribeToDemoPreference,
    readDemoPreference,
    () => false
  );

  useEffect(() => {
    if (urlDemo) {
      if (!sessionDemo) {
        sessionStorage.setItem(DEMO_STORAGE_KEY, '1');
        emitDemoPreferenceChange();
      }
      return;
    }

    if (status === 'authenticated' && sessionDemo) {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
      emitDemoPreferenceChange();
    }
  }, [sessionDemo, status, urlDemo]);

  const isDemo = urlDemo || (status !== 'authenticated' && sessionDemo);

  if (isDemo) {
    return <DemoProvider>{children}</DemoProvider>;
  }

  return <>{children}</>;
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
