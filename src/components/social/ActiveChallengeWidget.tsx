'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useChallengesQuery } from '@/hooks/api/useChallengeHooks';

export function ActiveChallengeWidget() {
  const { data: challenges } = useChallengesQuery();

  // Find a challenge the user has joined and is in progress
  const active = challenges?.find(
    (c) => c.userProgress?.status === 'IN_PROGRESS',
  );

  if (!active) {
    return (
      <Link href="/dashboard/challenges">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-red-50 p-4 shadow-md transition hover:shadow-lg dark:border-orange-900/30 dark:from-orange-950/20 dark:to-red-950/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Community Challenges</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Join a challenge to earn bonus XP</p>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  const progress = active.userProgress?.progress ?? 0;

  return (
    <Link href="/dashboard/challenges">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-red-50 p-4 shadow-md transition hover:shadow-lg dark:border-orange-900/30 dark:from-orange-950/20 dark:to-red-950/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{active.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">+{active.xpReward} XP</p>
            </div>
          </div>
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-orange-200/60 dark:bg-orange-900/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </Link>
  );
}
