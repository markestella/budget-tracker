'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface BudgetSuggestionCardProps {
  suggestion: {
    id: string;
    category: string;
    currentAmount: number;
    suggestedAmount: number;
    reasoning: string;
    estimatedSavings: number;
    status: string;
  };
  onApply?: (id: string) => void;
  isApplying?: boolean;
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

const fmt = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function BudgetSuggestionCard({ suggestion, onApply, isApplying }: BudgetSuggestionCardProps) {
  const isApplied = suggestion.status === 'APPLIED';
  const isDismissed = suggestion.status === 'DISMISSED';
  const diff = suggestion.suggestedAmount - suggestion.currentAmount;
  const isReduction = diff < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border p-4 shadow-sm',
        isApplied
          ? 'border-green-200/60 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/10'
          : isDismissed
            ? 'border-slate-200/60 bg-slate-50/50 opacity-60 dark:border-slate-700/40 dark:bg-slate-800/20'
            : 'border-violet-200/60 bg-gradient-to-br from-violet-50 to-purple-50 dark:border-violet-900/40 dark:from-violet-950/20 dark:to-purple-950/20',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {categoryLabels[suggestion.category] ?? suggestion.category}
            </span>
            {isApplied && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                Applied ✓
              </span>
            )}
          </div>

          {/* Before / After */}
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              ₱{fmt.format(suggestion.currentAmount)}
            </span>
            <span className="text-slate-400 dark:text-slate-500">→</span>
            <span className={cn(
              'font-semibold',
              isReduction ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400',
            )}>
              ₱{fmt.format(suggestion.suggestedAmount)}
            </span>
            {suggestion.estimatedSavings > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400">
                (save ₱{fmt.format(suggestion.estimatedSavings)}/mo)
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {suggestion.reasoning}
          </p>
        </div>

        {suggestion.status === 'PENDING' && onApply && (
          <Button
            size="sm"
            onClick={() => onApply(suggestion.id)}
            isLoading={isApplying}
            className="shrink-0"
          >
            Apply
          </Button>
        )}
      </div>
    </motion.div>
  );
}
