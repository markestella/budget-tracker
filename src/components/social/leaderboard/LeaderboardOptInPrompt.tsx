'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLeaderboardOptInQuery, useLeaderboardOptInMutation } from '@/hooks/api/useLeaderboardHooks';
import { useDemoGuard } from '@/hooks/useDemoGuard';

export function LeaderboardOptInPrompt() {
  const [displayName, setDisplayName] = useState('');
  const { data: optIn, isLoading } = useLeaderboardOptInQuery();
  const mutation = useLeaderboardOptInMutation();
  const guardMutation = useDemoGuard();

  if (isLoading) return null;
  if (optIn?.isOptedIn) return null;

  const handleOptIn = () => {
    if (!guardMutation()) return;
    if (!displayName.trim() || displayName.length < 2) return;
    mutation.mutate({ isOptedIn: true, displayName: displayName.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg dark:border-amber-900/30 dark:from-amber-950/30 dark:to-orange-950/30"
    >
      <div className="text-center">
        <span className="text-4xl">🏆</span>
        <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
          Join the Leaderboard
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Opt in to compete with others. Your financial data stays private — only your display name, level, and XP are shown.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <input
            type="text"
            placeholder="Choose a display name..."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={30}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-64"
          />
          <button
            onClick={handleOptIn}
            disabled={mutation.isPending || displayName.length < 2}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg disabled:opacity-50 sm:w-auto"
          >
            {mutation.isPending ? 'Joining...' : 'Join Leaderboard'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
