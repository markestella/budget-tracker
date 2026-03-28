'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeProvider';
import { ChatDrawer } from '../ai/chat/ChatDrawer';
import { DemoProvider } from '@/components/providers/DemoProvider';
import { DemoBanner } from './DemoBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

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

  const mainMarginLeft = sidebarCollapsed ? 'ml-16' : 'ml-64';
  const mainBg = isDark ? 'bg-gray-900' : 'bg-gray-50';

  const content = (
    <div className={`min-h-screen ${mainBg}`}>
      {isDemo && <DemoBanner />}
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={handleSidebarToggle} 
      />

      {/* Main Content */}
      <main className={`${mainMarginLeft} transition-all duration-300 min-h-screen`}>
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>

      {/* AI Chat Floating Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:bg-violet-700 hover:shadow-xl active:scale-95 dark:bg-violet-500 dark:hover:bg-violet-600"
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

  if (isDemo) {
    return <DemoProvider>{content}</DemoProvider>;
  }

  return content;
};

export default DashboardLayout;