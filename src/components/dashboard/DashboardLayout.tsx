'use client';

import React, { useState, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeProvider';
import ThemeToggle from '../ThemeToggle';
import { ChatDrawer } from '../ai/chat/ChatDrawer';
import { useDemo } from '@/components/providers/DemoProvider';
import { DemoBanner } from './DemoBanner';
import { BottomTabBar } from './BottomTabBar';
import { MobileFinanceNav } from './MobileFinanceNav';
import { isFinanceRoute } from './nav-config';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { isDemo } = useDemo();
  const showFinanceLayout = isFinanceRoute(pathname);

  useEffect(() => {
    if (!isDemo && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, isDemo]);

  // Show loading state while checking authentication
  if (!isDemo && status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (skip for demo mode)
  if (!isDemo && !session) {
    return null;
  }

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const mainMarginLeft = showFinanceLayout
    ? sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
    : '';
  const mainBg = isDark ? 'bg-gray-900' : 'bg-gray-50';

  const isHome = pathname === '/dashboard';

  const content = (
    <div className={`min-h-screen ${mainBg}`}>
      {isDemo && <DemoBanner />}

      {/* Mobile top bar — branding + utilities */}
      <div className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden ${
        isDark ? 'border-b border-gray-700 bg-gray-900/95 backdrop-blur' : 'border-b border-gray-200 bg-white/95 backdrop-blur'
      } safe-area-top`}>
        <div className="flex items-center">
          {!isHome && (
            <button
              onClick={() => router.back()}
              className={`p-1.5 -ml-1 mr-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              aria-label="Go back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className={`w-7 h-7 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center mr-2`}>
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-semibold text-sm leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              MoneySuite
            </span>
            <span className={`text-[9px] leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              by MoneyQuest
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/dashboard/settings"
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Desktop top utility bar — always visible */}
      <div className={`hidden lg:flex items-center justify-between gap-3 px-6 py-2 ${
        showFinanceLayout
          ? sidebarCollapsed ? 'ml-16' : 'ml-64'
          : ''
      } transition-all duration-300 ${
        isDark ? 'border-b border-gray-800 bg-gray-900/80' : 'border-b border-gray-100 bg-white/80'
      } sticky top-0 z-30 backdrop-blur`}>
        <div>
          {!isHome && !showFinanceLayout && (
            <button
              onClick={() => router.back()}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm ${
                isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Go back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/dashboard/settings"
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          aria-label="Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          aria-label="Sign out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile finance sub-nav — only on finance routes */}
      {showFinanceLayout && <MobileFinanceNav />}

      {/* Desktop sidebar — only on finance routes */}
      {showFinanceLayout && (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      )}

      {/* Main Content */}
      <main className={`${mainMarginLeft} transition-all duration-300 min-h-screen pb-16 lg:pb-0`}>
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>

      {/* Bottom Tab Bar — mobile only */}
      <BottomTabBar />

      {/* AI Chat Floating Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:bg-violet-700 hover:shadow-xl active:scale-95 dark:bg-violet-500 dark:hover:bg-violet-600"
        aria-label="Open AI Chat"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* AI Chat Drawer */}
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );

  return content;
};

function DashboardLayoutWrapper({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}

export default DashboardLayoutWrapper;