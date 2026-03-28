'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useLeaderboardQuery,
  useLeaderboardOptInQuery,
  useMyRankQuery,
} from '@/hooks/api/useLeaderboardHooks';
import { LeaderboardOptInPrompt } from './LeaderboardOptInPrompt';

const TYPES = ['XP', 'STREAK', 'HEALTH_SCORE', 'CHALLENGES'] as const;
const TYPE_LABELS: Record<string, string> = {
  XP: '⚡ XP',
  STREAK: '🔥 Streak',
  HEALTH_SCORE: '💚 Health Score',
  CHALLENGES: '🏅 Challenges',
};

const PERIODS = ['WEEKLY', 'MONTHLY', 'ALL_TIME'] as const;
const PERIOD_LABELS: Record<string, string> = {
  WEEKLY: 'This Week',
  MONTHLY: 'This Month',
  ALL_TIME: 'All Time',
};

export function LeaderboardPage() {
  const [type, setType] = useState<string>('XP');
  const [period, setPeriod] = useState<string>('WEEKLY');
  const [page, setPage] = useState(1);

  const { data: optIn, isLoading: optInLoading } = useLeaderboardOptInQuery();
  const { data, isLoading } = useLeaderboardQuery(type, period, page);
  const { data: myRank } = useMyRankQuery(type, period, !!optIn?.isOptedIn);

  if (optInLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!optIn?.isOptedIn) {
    return <LeaderboardOptInPrompt />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* My rank card */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-900/30 dark:from-amber-950/30 dark:to-orange-950/30"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">#{myRank.rank}</span>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{myRank.displayName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Level {myRank.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{myRank.score.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">of {myRank.totalParticipants} players</p>
          </div>
        </motion.div>
      )}

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setPage(1); }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              type === t
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/60 text-slate-600 hover:bg-white dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Period toggle */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => { setPeriod(p); setPage(1); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              period === p
                ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Rankings table */}
      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        ) : !data?.entries.length ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            No rankings yet. Be the first!
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${type}-${period}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Player</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Level</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry) => (
                    <tr key={entry.userId} className="border-b border-slate-50 transition hover:bg-amber-50/30 dark:border-slate-800/50 dark:hover:bg-amber-950/10">
                      <td className="px-4 py-3">
                        <span className="text-lg">{entry.medalEmoji ?? `#${entry.rank}`}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{entry.avatarEmoji}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{entry.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-500 dark:text-slate-400">Lv. {entry.level}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">{entry.score.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(data.totalPages, page + 1))}
            disabled={page >= data.totalPages}
            className="rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
