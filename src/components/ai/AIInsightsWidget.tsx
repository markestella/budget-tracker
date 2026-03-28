'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSpendingPatternsQuery } from '@/hooks/api/useAIInsightsHooks';

export function AIInsightsWidget() {
  const { data } = useSpendingPatternsQuery();
  const patterns = data?.patterns ?? [];

  // Show top 2 high-deviation overspend patterns
  const alerts = patterns
    .filter((p) => p.type === 'OVERSPEND')
    .sort((a, b) => b.deviation - a.deviation)
    .slice(0, 2);

  if (alerts.length === 0) {
    return (
      <Link href="/dashboard/ai/insights">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 shadow-md transition hover:shadow-lg dark:border-violet-900/30 dark:from-violet-950/20 dark:to-indigo-950/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">AI Insights</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Analyze your spending patterns with AI</p>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href="/dashboard/ai/insights">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 shadow-md transition hover:shadow-lg dark:border-violet-900/30 dark:from-violet-950/20 dark:to-indigo-950/20"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🤖</span>
          <p className="text-sm font-medium text-slate-900 dark:text-white">AI Alerts</p>
        </div>
        <div className="space-y-1.5">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                +{a.deviation.toFixed(0)}%
              </span>
              <span className="text-slate-600 dark:text-slate-300 truncate">{a.category.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
