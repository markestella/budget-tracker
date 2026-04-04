'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DemoProvider } from '@/components/providers/DemoProvider';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const urlDemo = searchParams.get('demo') === 'true';
  const [sessionDemo, setSessionDemo] = useState(false);

  useEffect(() => {
    if (urlDemo) {
      sessionStorage.setItem('demo', '1');
      setSessionDemo(true);
    } else if (status === 'authenticated') {
      sessionStorage.removeItem('demo');
      setSessionDemo(false);
    } else {
      setSessionDemo(sessionStorage.getItem('demo') === '1');
    }
  }, [urlDemo, status]);

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
