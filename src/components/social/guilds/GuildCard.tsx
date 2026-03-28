'use client';

import { motion } from 'framer-motion';
import type { GuildSummary } from '@/hooks/api/useGuildHooks';

interface GuildCardProps {
  guild: GuildSummary;
  onClick: () => void;
}

export function GuildCard({ guild, onClick }: GuildCardProps) {
  const roleColors: Record<string, string> = {
    OWNER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    MEMBER: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-2xl border border-white/60 bg-white/80 p-5 text-left shadow-md backdrop-blur transition hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-950/80"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{guild.name}</h3>
          {guild.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
              {guild.description}
            </p>
          )}
        </div>
        <span className={`ml-2 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${roleColors[guild.myRole] ?? roleColors.MEMBER}`}>
          {guild.myRole}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          👥 {guild.memberCount}
        </span>
        {guild.isPublic && (
          <span className="flex items-center gap-1">🌐 Public</span>
        )}
      </div>

      {guild.activeChallenge && (
        <div className="mt-3 rounded-lg bg-amber-50/80 p-2.5 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-amber-700 dark:text-amber-300">
              🎯 {guild.activeChallenge.title}
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              {guild.activeChallenge.currentValue}/{guild.activeChallenge.targetValue}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
              style={{ width: `${Math.min(100, (guild.activeChallenge.currentValue / guild.activeChallenge.targetValue) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.button>
  );
}
