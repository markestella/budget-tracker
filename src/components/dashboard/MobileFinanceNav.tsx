'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import { financeNavItems } from './nav-config';
import { useDemo } from '@/components/providers/DemoProvider';

export function MobileFinanceNav() {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { isDemo } = useDemo();
  const demoSuffix = isDemo ? '?demo=true' : '';

  return (
    <div
      className={`lg:hidden overflow-x-auto border-b scrollbar-hide ${
        isDark ? 'border-gray-800 bg-gray-950/90' : 'border-gray-200 bg-white/90'
      } backdrop-blur`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <nav aria-label="Finance navigation" className="flex gap-1 px-3 py-2 min-w-max">
        {financeNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={`${item.href}${demoSuffix}`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
