'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BadgeData } from '@/hooks/api/useGameBadges';

const tierColors: Record<string, string> = {
  BRONZE: 'border-amber-600 bg-amber-50 dark:bg-amber-950/30',
  SILVER: 'border-slate-400 bg-slate-50 dark:bg-slate-800/50',
  GOLD: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
  PLATINUM: 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/30',
  DIAMOND: 'border-purple-400 bg-purple-50 dark:bg-purple-950/30',
};

const tierGlows: Record<string, string> = {
  BRONZE: 'shadow-amber-500/20',
  SILVER: 'shadow-slate-400/20',
  GOLD: 'shadow-yellow-400/30',
  PLATINUM: 'shadow-cyan-400/30',
  DIAMOND: 'shadow-purple-400/40',
};

export function BadgeCard({
  badge,
  onClick,
}: {
  badge: BadgeData;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={badge.earned ? { scale: 1.05, y: -2 } : undefined}
      whileTap={badge.earned ? { scale: 0.98 } : undefined}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
        badge.earned
          ? cn(tierColors[badge.tier], tierGlows[badge.tier], 'shadow-lg cursor-pointer')
          : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 cursor-default grayscale'
      )}
    >
      <span className="text-3xl" role="img" aria-label={badge.name}>
        {badge.icon}
      </span>
      <span className="text-xs font-medium text-center leading-tight line-clamp-2">
        {badge.name}
      </span>
      {badge.earned && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          +{badge.xpReward} XP
        </span>
      )}
    </motion.button>
  );
}
