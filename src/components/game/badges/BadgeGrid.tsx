'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useGameBadgesQuery, BadgeData } from '@/hooks/api/useGameBadges';
import { BadgeCard } from './BadgeCard';
import { BadgeUnlockModal } from './BadgeUnlockModal';

const categories = [
  { key: 'ALL', label: 'All' },
  { key: 'STARTER', label: 'Starter' },
  { key: 'SAVINGS', label: 'Savings' },
  { key: 'DISCIPLINE', label: 'Discipline' },
  { key: 'BUDGET', label: 'Budget' },
  { key: 'MILESTONE', label: 'Milestone' },
  { key: 'SPECIAL', label: 'Special' },
];

export function BadgeGrid({ className }: { className?: string }) {
  const { data: badges, isLoading } = useGameBadgesQuery();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  const filtered =
    selectedCategory === 'ALL'
      ? badges ?? []
      : (badges ?? []).filter((b) => b.category === selectedCategory);

  const earnedCount = (badges ?? []).filter((b) => b.earned).length;
  const totalCount = (badges ?? []).length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Badges</h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {earnedCount}/{totalCount} earned
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              selectedCategory === cat.key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {filtered.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>

      {selectedBadge && (
        <BadgeUnlockModal
          badge={selectedBadge}
          open={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
