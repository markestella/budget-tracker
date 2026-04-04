'use client';

import { motion } from 'framer-motion';
import type { ChallengeDefinition } from '@/hooks/api/useChallengeHooks';
import { useJoinChallengeMutation } from '@/hooks/api/useChallengeHooks';
import { useDemoGuard } from '@/hooks/useDemoGuard';

interface FeaturedChallengeProps {
  challenge: ChallengeDefinition;
}

export function FeaturedChallenge({ challenge }: FeaturedChallengeProps) {
  const joinMutation = useJoinChallengeMutation();
  const guardMutation = useDemoGuard();
  const isJoined = !!challenge.userProgress;
  const isCompleted = challenge.userProgress?.status === 'COMPLETED';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-lg dark:border-amber-900/30 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10"
    >
      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Featured Challenge
          </span>
        </div>
        <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{challenge.title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{challenge.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            +{challenge.xpReward} XP
          </span>
          {challenge.exclusiveBadgeKey && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              🏅 Exclusive Badge
            </span>
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">
            👥 {challenge.participantCount} participants
          </span>
        </div>

        {isJoined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Your progress</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {challenge.userProgress?.progress ?? 0}%
              </span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${challenge.userProgress?.progress ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {!isJoined && !isCompleted && (
          <button
            onClick={() => { if (!guardMutation()) return; joinMutation.mutate(challenge.id); }}
            disabled={joinMutation.isPending}
            className="mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg disabled:opacity-50"
          >
            {joinMutation.isPending ? 'Joining...' : 'Join This Challenge'}
          </button>
        )}

        {isCompleted && (
          <p className="mt-4 text-sm font-semibold text-green-600 dark:text-green-400">
            🎉 You&apos;ve completed this challenge!
          </p>
        )}
      </div>
    </motion.div>
  );
}
