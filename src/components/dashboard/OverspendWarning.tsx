'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CircleAlert, OctagonAlert, X } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return `₱${currencyFormatter.format(value)}`;
}

function getDaysRemaining() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return Math.max(
    0,
    Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function getThresholdLevel(value: number) {
  if (value >= 100) {
    return 100;
  }

  if (value >= 90) {
    return 90;
  }

  if (value >= 80) {
    return 80;
  }

  return 0;
}

export function OverspendWarning({
  budgetUsedPercent,
  totalBudget,
  totalExpenses,
}: {
  budgetUsedPercent: number;
  totalBudget: number;
  totalExpenses: number;
}) {
  const threshold = getThresholdLevel(budgetUsedPercent);
  const [dismissedThreshold, setDismissedThreshold] = useState(0);
  const daysRemaining = getDaysRemaining();

  if (threshold === 0 || threshold <= dismissedThreshold) {
    return null;
  }

  const exceededAmount = Math.max(totalExpenses - totalBudget, 0);
  const severityConfig =
    threshold >= 100
      ? {
          icon: OctagonAlert,
          title: 'Budget exceeded',
          description: `You've exceeded your budget by ${formatCurrency(exceededAmount)}.`,
          className:
            'border-rose-300/70 bg-rose-50/90 text-rose-900 dark:border-rose-900/80 dark:bg-rose-950/35 dark:text-rose-100',
        }
      : threshold >= 90
        ? {
            icon: AlertTriangle,
            title: 'Budget nearly exhausted',
            description: 'Budget nearly exhausted.',
            className:
              'border-orange-300/70 bg-orange-50/90 text-orange-900 dark:border-orange-900/80 dark:bg-orange-950/35 dark:text-orange-100',
          }
        : {
            icon: CircleAlert,
            title: 'Budget warning',
            description: `You've used 80% of your budget with ${daysRemaining} days left.`,
            className:
              'border-amber-300/70 bg-amber-50/90 text-amber-900 dark:border-amber-900/80 dark:bg-amber-950/35 dark:text-amber-100',
          };

  const Icon = severityConfig.icon;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Alert className={severityConfig.className}>
          <div className="flex items-start gap-3 pr-10">
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <AlertTitle>{severityConfig.title}</AlertTitle>
              <AlertDescription>{severityConfig.description}</AlertDescription>
            </div>
          </div>
          <button
            aria-label="Dismiss budget warning"
            className="absolute right-3 top-3 rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => {
              setDismissedThreshold(threshold);
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}