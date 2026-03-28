'use client';

import Link from 'next/link';
import { useDemo } from '@/components/providers/DemoProvider';

export function DemoBanner() {
  const { isDemo } = useDemo();
  if (!isDemo) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <span>🎮 Demo Mode — This is sample data.</span>
      <Link
        href="/register"
        className="rounded-md bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-900"
      >
        Sign up to save your data
      </Link>
    </div>
  );
}
