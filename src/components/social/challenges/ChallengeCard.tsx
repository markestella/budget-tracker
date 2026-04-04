'use client';

import { motion } from 'framer-motion';
import { useJoinChallengeMutation, useTrackChallengeMutation, type ChallengeDefinition } from '@/hooks/api/useChallengeHooks';
import { useDemoGuard } from '@/hooks/useDemoGuard';
import { useState } from 'react';

interface ChallengeCardProps {
  challenge: ChallengeDefinition;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const joinMutation = useJoinChallengeMutation();
  const trackMutation = useTrackChallengeMutation();
  const guardMutation = useDemoGuard();
  const [progress, setProgress] = useState(challenge.userProgress?.progress ?? 0);

  const isJoined = !!challenge.userProgress;
  const isCompleted = challenge.userProgress?.status === 'COMPLETED';

  const handleTrack = () => {
    if (!guardMutation()) return;
    trackMutation.mutate({ challengeId: challenge.id, progress });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{challenge.title}</h3>
            {isCompleted && <span className="text-lg">✅</span>}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{challenge.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">+{challenge.xpReward} XP</span>
          {challenge.exclusiveBadgeKey && (
            <p className="mt-0.5 text-xs text-purple-500">🏅 Exclusive badge</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium dark:bg-slate-800">
          {challenge.type}
        </span>
        <span>👥 {challenge.participantCount} participants</span>
      </div>

      {/* Progress bar for joined challenges */}
      {isJoined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>{challenge.userProgress?.progress ?? 0}%</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${challenge.userProgress?.progress ?? 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4">
        {!isJoined ? (
          <button
            onClick={() => { if (!guardMutation()) return; joinMutation.mutate(challenge.id); }}
            disabled={joinMutation.isPending}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-medium text-white shadow transition hover:shadow-md disabled:opacity-50"
          >
            {joinMutation.isPending ? 'Joining...' : 'Join Challenge'}
          </button>
        ) : !isCompleted ? (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="w-10 text-center text-sm font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
            <button
              onClick={handleTrack}
              disabled={trackMutation.isPending}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        ) : (
          <div className="text-center text-sm font-medium text-green-600 dark:text-green-400">
            🎉 Challenge completed!
          </div>
        )}
      </div>
    </motion.div>
  );
}
