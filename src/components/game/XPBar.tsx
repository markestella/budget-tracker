'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useGameProfileQuery } from '@/hooks/api/useGameProfile';

function LevelBadge({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-amber-500/25">
      <Star className="h-3.5 w-3.5 fill-current" />
      {level}
    </div>
  );
}

export function XPBar({ className }: { className?: string }) {
  const { data: profile, isLoading } = useGameProfileQuery();

  if (isLoading || !profile) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="h-8 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 flex-1 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  const { level, currentXP, xpNeeded, progress } = profile;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={level}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <LevelBadge level={level} />
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Level {level}</span>
          <span>{currentXP.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {progress > 0 && (
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-white/30"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              style={{ filter: 'blur(2px)' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
