'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveQuestsQuery, useCheckQuestsMutation, UserQuestData } from '@/hooks/api/useGameQuests';
import Button from '@/components/ui/Button';

function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function QuestItem({ quest }: { quest: UserQuestData }) {
  const isComplete = quest.status === 'COMPLETED';
  const progress = Math.min(quest.progress, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-3 transition-colors',
        isComplete
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            <span className={cn('text-sm font-medium', isComplete && 'line-through text-slate-400')}>
              {quest.questDefinition.title}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {quest.questDefinition.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            +{quest.questDefinition.xpReward} XP
          </span>
          {!isComplete && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="h-3 w-3" />
              {timeRemaining(quest.expiresAt)}
            </span>
          )}
        </div>
      </div>

      {!isComplete && (
        <div className="mt-2 flex items-center gap-2">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-medium text-slate-500">{progress}%</span>
        </div>
      )}
    </motion.div>
  );
}

function QuestList({ quests }: { quests: UserQuestData[] }) {
  if (quests.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        No quests right now. Check back soon!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {quests.map((q) => (
        <QuestItem key={q.id} quest={q} />
      ))}
    </div>
  );
}

export function QuestPanel({ className }: { className?: string }) {
  const { data: quests, isLoading } = useActiveQuestsQuery();
  const checkMutation = useCheckQuestsMutation();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const daily = (quests ?? []).filter((q) => q.questDefinition.type === 'DAILY');
  const weekly = (quests ?? []).filter((q) => q.questDefinition.type === 'WEEKLY');
  const monthly = (quests ?? []).filter((q) => q.questDefinition.type === 'MONTHLY');

  const tabs = [
    { key: 'daily' as const, label: 'Daily', emoji: '📋', quests: daily },
    { key: 'weekly' as const, label: 'Weekly', emoji: '📅', quests: weekly },
    { key: 'monthly' as const, label: 'Monthly', emoji: '🗓️', quests: monthly },
  ];

  const activeQuests = tabs.find((t) => t.key === activeTab)?.quests ?? [];

  return (
    <div className={cn(
      'rounded-2xl border border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50/80 to-transparent px-6 pt-6 pb-4 dark:from-blue-950/20 dark:to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            ⚔️ Quests
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkMutation.mutate()}
            disabled={checkMutation.isPending}
          >
            {checkMutation.isPending ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation — pill-style horizontal */}
      <div className="px-4 pt-2">
        <div className="flex gap-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/60">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-150',
                activeTab === t.key
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              <span className="block text-base leading-none">{t.emoji}</span>
              <span className="mt-0.5 block">{t.label} ({t.quests.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quest List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ) : (
          <QuestList quests={activeQuests} />
        )}
      </div>
    </div>
  );
}
