'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import { sidebarNavItems, type NavItem } from './nav-config';

// Re-export for backward compatibility
export type SidebarItem = NavItem;
export const sidebarItems = sidebarNavItems;

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  const sidebarBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextColor = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${sidebarWidth} ${sidebarBg} border-r transition-all duration-300 hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 shadow-lg`}>
      {/* Header with collapse toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <div className="flex items-center min-w-0">
                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center mr-3 flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-semibold text-sm leading-tight ${textColor}`}>
                    MoneySuite
                  </span>
                  <span className={`text-[10px] leading-tight ${mutedTextColor}`}>
                    by MoneyQuest
                  </span>
                </div>
              </div>
              <button
                onClick={onToggle}
                aria-label="Collapse sidebar"
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              aria-label="Expand sidebar"
              className={`w-8 h-8 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center mx-auto hover:opacity-90 transition-opacity`}
            >
              <span className="text-white font-bold text-sm">M</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const activeClasses = isActive 
            ? isDark 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white'
            : isDark 
              ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

          return (
            <Link key={item.id} href={item.href} title={isCollapsed ? item.label : undefined}>
              <div className={`relative group flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-lg transition-colors cursor-pointer ${activeClasses}`}>
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm">
                    {item.label}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-lg">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Back button */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <button
          onClick={() => router.back()}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Go back"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium">Back</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;