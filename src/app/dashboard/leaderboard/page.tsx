'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FadeIn } from '@/components/animations/FadeIn';
import { LeaderboardPage } from '@/components/social/leaderboard/LeaderboardPage';

export default function LeaderboardDashboardPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(234,88,12,0.10),_transparent_28%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <FadeIn className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
              Social
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Compete with other players across different categories
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <LeaderboardPage />
          </FadeIn>
        </div>
      </div>
    </DashboardLayout>
  );
}
