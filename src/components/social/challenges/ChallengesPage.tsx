'use client';

import { useChallengesQuery } from '@/hooks/api/useChallengeHooks';
import { ChallengeCard } from './ChallengeCard';
import { FeaturedChallenge } from './FeaturedChallenge';

export function ChallengesPage() {
  const { data: challenges, isLoading } = useChallengesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!challenges?.length) {
    return (
      <div className="py-12 text-center">
        <span className="text-4xl">🎯</span>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          No active challenges right now. Check back soon!
        </p>
      </div>
    );
  }

  // First challenge is the featured one (most recently created)
  const [featured, ...rest] = challenges;

  return (
    <div className="flex flex-col gap-6">
      <FeaturedChallenge challenge={featured} />

      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  );
}
