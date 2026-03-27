'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FadeIn } from '@/components/animations/FadeIn';
import { XPBar } from '@/components/game/XPBar';
import { StreakDisplay } from '@/components/game/StreakDisplay';
import { BadgeGrid } from '@/components/game/badges/BadgeGrid';
import { BadgeShowcase } from '@/components/game/badges/BadgeShowcase';
import { HealthScoreWidget } from '@/components/game/HealthScoreWidget';
import { QuestPanel } from '@/components/game/QuestPanel';
import { AvatarEditor } from '@/components/game/avatar/AvatarEditor';

export default function GameProfilePage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.10),_transparent_28%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          {/* Header */}
          <FadeIn className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 sm:p-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
                  MoneyQuest
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Game Profile
                </h1>
              </div>
              <BadgeShowcase />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <XPBar className="flex-1 max-w-md" />
              <StreakDisplay />
            </div>
          </FadeIn>

          {/* Main content */}
          <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <div className="flex flex-col gap-6">
              <FadeIn delay={0.1}>
                <BadgeGrid />
              </FadeIn>
              <FadeIn delay={0.2}>
                <QuestPanel />
              </FadeIn>
            </div>
            <div className="flex flex-col gap-6">
              <FadeIn delay={0.15}>
                <AvatarEditor />
              </FadeIn>
              <FadeIn delay={0.25}>
                <HealthScoreWidget />
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
