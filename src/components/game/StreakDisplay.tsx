'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStreaksQuery, useStreakFreezeMutation } from '@/hooks/api/useGameStreaks';
import Button from '@/components/ui/Button';

function getFlameIntensity(streak: number) {
  if (streak >= 90) return { size: 'text-4xl', label: 'Inferno!', pulseClass: 'animate-pulse' };
  if (streak >= 30) return { size: 'text-3xl', label: 'On Fire!', pulseClass: '' };
  if (streak >= 7) return { size: 'text-2xl', label: 'Heating Up', pulseClass: '' };
  return { size: 'text-xl', label: '', pulseClass: '' };
}

export function StreakDisplay({ className }: { className?: string }) {
  const { data: streak, isLoading } = useGameStreaksQuery();
  const freezeMutation = useStreakFreezeMutation();

  if (isLoading || !streak) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  const { size, label, pulseClass } = getFlameIntensity(streak.current);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        className={cn('flex items-center gap-1', pulseClass)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <span className={size} role="img" aria-label="streak">🔥</span>
        <span className="text-2xl font-bold">{streak.current}</span>
      </motion.div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">
            day{streak.current !== 1 ? 's' : ''} streak
          </span>
          {streak.isAtRisk && (
            <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
              At risk!
            </span>
          )}
          {label && (
            <span className="text-xs text-amber-500">{label}</span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          Best: {streak.longest} day{streak.longest !== 1 ? 's' : ''}
          {streak.nextMilestone && ` · Next: ${streak.nextMilestone}🔥`}
        </span>
      </div>

      {streak.isAtRisk && streak.freezesRemaining > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="ml-auto shrink-0"
          onClick={() => freezeMutation.mutate()}
          disabled={freezeMutation.isPending}
        >
          <Shield className="mr-1 h-3.5 w-3.5" />
          Freeze ({streak.freezesRemaining})
        </Button>
      )}
    </div>
  );
}
