'use client';

import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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

export function BudgetHealthBar({
  spent,
  budget,
}: {
  spent: number;
  budget: number;
}) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const daysRemaining = getDaysRemaining();
  const remainingBudget = Math.max(budget - spent, 0);
  const dailyAllowance =
    daysRemaining > 0 && remainingBudget > 0 ? remainingBudget / daysRemaining : 0;

  return (
    <Card className="border-white/60 bg-white/85 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950/85">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-950 dark:text-white">
          Budget health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>
            {formatCurrency(spent)} / {formatCurrency(budget)} ({Math.round(percentage)}%)
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
          <motion.div
            animate={{ width: `${clampedPercentage}%` }}
            className="h-full rounded-full"
            initial={{ width: 0 }}
            style={{
              background:
                'linear-gradient(90deg, var(--chart-2) 0%, var(--chart-3) 70%, var(--chart-4) 100%)',
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {daysRemaining} days remaining · {formatCurrency(dailyAllowance)}/day allowance
        </p>
      </CardContent>
    </Card>
  );
}