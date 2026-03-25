'use client';

import { motion } from 'framer-motion';

import type { DashboardBudgetProgressDatum } from '@/hooks/api/useDashboardHooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return `₱${currencyFormatter.format(value)}`;
}

function getProgressTone(percentage: number) {
  if (percentage > 90) {
    return {
      fill: 'var(--chart-4)',
      text: 'text-rose-600 dark:text-rose-300',
    };
  }

  if (percentage >= 70) {
    return {
      fill: 'var(--chart-3)',
      text: 'text-amber-600 dark:text-amber-300',
    };
  }

  return {
    fill: 'var(--chart-2)',
    text: 'text-emerald-600 dark:text-emerald-300',
  };
}

export function BudgetProgressBars({
  data,
}: {
  data: DashboardBudgetProgressDatum[];
}) {
  const isEmpty = data.length === 0;

  return (
    <Card className="border-white/60 bg-white/85 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950/85">
      <CardHeader>
        <CardTitle>Budget progress</CardTitle>
        <CardDescription>
          Category-by-category spending against available budget names.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            No budget categories are available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((entry, index) => {
              const tone = getProgressTone(entry.percentage);
              const clampedPercentage = Math.min(Math.max(entry.percentage, 0), 100);

              return (
                <div
                  key={`${entry.category}-${entry.budget}-${entry.spent}`}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950 dark:text-slate-100">
                        {entry.category}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(entry.spent)} / {formatCurrency(entry.budget)}
                      </p>
                    </div>
                    <p className={`text-sm font-semibold ${tone.text}`}>
                      {Math.round(entry.percentage)}%
                    </p>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800/90">
                    <motion.div
                      animate={{ width: `${clampedPercentage}%` }}
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      style={{ backgroundColor: tone.fill }}
                      transition={{ duration: 0.7, delay: index * 0.06, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}