'use client';

import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BadgeData } from '@/hooks/api/useGameBadges';

const tierLabels: Record<string, string> = {
  BRONZE: '🥉 Bronze',
  SILVER: '🥈 Silver',
  GOLD: '🥇 Gold',
  PLATINUM: '💎 Platinum',
  DIAMOND: '👑 Diamond',
};

export function BadgeUnlockModal({
  badge,
  open,
  onClose,
}: {
  badge: BadgeData;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="text-center sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="sr-only">{badge.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Badge details for {badge.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <span className="text-6xl" role="img" aria-label={badge.name}>
              {badge.icon}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <h3 className="text-lg font-bold">{badge.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {badge.description}
            </p>
          </motion.div>

          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 dark:bg-slate-800">
              {tierLabels[badge.tier] ?? badge.tier}
            </span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              +{badge.xpReward} XP
            </span>
          </div>

          {badge.earned && badge.earnedAt && (
            <p className="text-xs text-slate-400">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}

          {!badge.earned && (
            <p className="text-xs text-slate-400">🔒 Not yet earned</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
