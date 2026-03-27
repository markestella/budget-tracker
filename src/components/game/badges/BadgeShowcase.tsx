'use client';

import { cn } from '@/lib/utils';
import { useGameBadgesQuery, BadgeData } from '@/hooks/api/useGameBadges';

export function BadgeShowcase({ className }: { className?: string }) {
  const { data: badges } = useGameBadgesQuery();

  const showcased = (badges ?? []).filter((b) => b.isShowcased && b.earned);

  if (showcased.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showcased.map((badge: BadgeData) => (
        <div
          key={badge.id}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          title={badge.name}
        >
          <span className="text-lg">{badge.icon}</span>
        </div>
      ))}
    </div>
  );
}
