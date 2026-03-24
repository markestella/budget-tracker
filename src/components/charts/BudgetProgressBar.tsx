'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface BudgetProgressBarProps {
  className?: string;
  current: number;
  label?: string;
  target: number;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  currency: 'PHP',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function BudgetProgressBar({
  className,
  current,
  label = 'Budget progress',
  target,
}: BudgetProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className={cn('rounded-3xl border p-4 shadow-sm', className)} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{currencyFormatter.format(current)} of {currencyFormatter.format(target)}</p>
        </div>
        <span className="text-sm font-semibold text-foreground">{Math.round(percentage)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted/70">
        <motion.div
          animate={{ width: `${percentage}%` }}
          className="h-full rounded-full"
          initial={{ width: 0 }}
          style={{
            background: 'linear-gradient(90deg, var(--chart-2), var(--chart-1))',
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}