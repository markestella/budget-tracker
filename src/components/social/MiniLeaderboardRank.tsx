'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLeaderboardOptInQuery, useMyRankQuery } from '@/hooks/api/useLeaderboardHooks';

export function MiniLeaderboardRank() {
  const { data: optIn } = useLeaderboardOptInQuery();
  const { data: myRank } = useMyRankQuery('XP', 'WEEKLY', !!optIn?.isOptedIn);

  if (!optIn?.isOptedIn) {
    return (
      <Link href="/dashboard/leaderboard">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-md transition hover:shadow-lg dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Join the Leaderboard</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Compete with other players</p>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href="/dashboard/leaderboard">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-md transition hover:shadow-lg dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Leaderboard Rank</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly XP</p>
            </div>
          </div>
          {myRank && (
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">#{myRank.rank}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">of {myRank.totalParticipants}</p>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
