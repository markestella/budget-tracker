'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpendingPatternCardProps {
  pattern: {
    id: string;
    type: string;
    category: string;
    deviation: number;
    insight: string;
    period: string;
  };
}

const categoryLabels: Record<string, string> = {
  HOUSING: '🏠 Housing',
  TRANSPORTATION: '🚗 Transport',
  FOOD_DINING: '🍽️ Food & Dining',
  UTILITIES: '⚡ Utilities',
  ENTERTAINMENT: '🎬 Entertainment',
  HEALTHCARE: '🏥 Healthcare',
  SAVINGS_ALLOCATION: '💰 Savings',
  DEBT_PAYMENTS: '💳 Debt',
  MISCELLANEOUS: '📦 Misc',
  CUSTOM: '🏷️ Custom',
};

export function SpendingPatternCard({ pattern }: SpendingPatternCardProps) {
  const isOverspend = pattern.type === 'OVERSPEND';
  const isTrend = pattern.type === 'TREND';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border p-4 shadow-sm',
        isOverspend
          ? 'border-red-200/60 bg-gradient-to-br from-red-50 to-orange-50 dark:border-red-900/40 dark:from-red-950/20 dark:to-orange-950/20'
          : isTrend
            ? 'border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-indigo-950/20'
            : 'border-green-200/60 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/40 dark:from-green-950/20 dark:to-emerald-950/20',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {isOverspend ? '🔴' : isTrend ? '🔵' : '🟢'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {categoryLabels[pattern.category] ?? pattern.category}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                isOverspend
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : isTrend
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
              )}
            >
              {isOverspend ? '+' : '-'}{Math.abs(pattern.deviation).toFixed(0)}%
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {pattern.insight}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {pattern.period}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
