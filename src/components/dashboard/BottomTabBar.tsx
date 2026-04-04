'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import { isFinanceRoute } from './nav-config';
import { useDemo } from '@/components/providers/DemoProvider';

interface TabDef {
  id: string;
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  match: (pathname: string) => boolean;
}

const tabs: TabDef[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/dashboard',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    match: (p) => p === '/dashboard',
  },
  {
    id: 'finance',
    label: 'Finance',
    href: '/dashboard/budgets',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    match: (p) => isFinanceRoute(p),
  },
  {
    id: 'game',
    label: 'Game',
    href: '/dashboard/game',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    match: (p) => p.startsWith('/dashboard/game') || p.startsWith('/dashboard/leaderboard') || p.startsWith('/dashboard/guilds') || p.startsWith('/dashboard/challenges') || p.startsWith('/dashboard/personality') || p.startsWith('/dashboard/feed'),
  },
  {
    id: 'ai',
    label: 'AI',
    href: '/dashboard/ai/insights',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.5" />
      </svg>
    ),
    match: (p) => p.startsWith('/dashboard/ai'),
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/dashboard/settings',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    match: (p) => p === '/dashboard/settings',
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { isDemo } = useDemo();
  const demoSuffix = isDemo ? '?demo=true' : '';

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t ${
        isDark
          ? 'bg-gray-950/95 border-gray-800 backdrop-blur-lg'
          : 'bg-white/95 border-gray-200 backdrop-blur-lg'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.id}
              href={`${tab.href}${demoSuffix}`}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[48px] transition-colors ${
                isActive
                  ? isDark
                    ? 'text-blue-400'
                    : 'text-blue-600'
                  : isDark
                    ? 'text-gray-500 active:text-gray-300'
                    : 'text-gray-400 active:text-gray-600'
              }`}
            >
              {tab.icon(isActive)}
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
