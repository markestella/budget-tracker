'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

  const daily = (quests ?? []).filter((q) => q.questDefinition.type === 'DAILY');
  const weekly = (quests ?? []).filter((q) => q.questDefinition.type === 'WEEKLY');
  const monthly = (quests ?? []).filter((q) => q.questDefinition.type === 'MONTHLY');

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Quests</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkMutation.mutate()}
            disabled={checkMutation.isPending}
          >
            {checkMutation.isPending ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">
                Daily ({daily.length})
              </TabsTrigger>
              <TabsTrigger value="weekly">
                Weekly ({weekly.length})
              </TabsTrigger>
              <TabsTrigger value="monthly">
                Monthly ({monthly.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-3">
              <QuestList quests={daily} />
            </TabsContent>
            <TabsContent value="weekly" className="mt-3">
              <QuestList quests={weekly} />
            </TabsContent>
            <TabsContent value="monthly" className="mt-3">
              <QuestList quests={monthly} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
