'use client';

import { motion } from 'framer-motion';
import { useFeedReactMutation, type FeedEvent } from '@/hooks/api/useSocialFeedHooks';
import { useDemoGuard } from '@/hooks/useDemoGuard';

const EMOJIS = ['👏', '🔥', '💪', '🎉'] as const;
const EVENT_ICONS: Record<string, string> = {
  LEVEL_UP: '⬆️',
  BADGE_EARNED: '🏅',
  STREAK_MILESTONE: '🔥',
  GUILD_CREATED: '🏰',
  CHALLENGE_COMPLETED: '🏆',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface AchievementFeedCardProps {
  event: FeedEvent;
}

export function AchievementFeedCard({ event }: AchievementFeedCardProps) {
  const reactMutation = useFeedReactMutation();
  const guardMutation = useDemoGuard();

  const handleReact = (emoji: string) => {
    if (!guardMutation()) return;
    reactMutation.mutate({ eventId: event.id, emoji });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-2xl">
          {EVENT_ICONS[event.eventType] ?? '✨'}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {event.userName}
            </span>
            <span className="text-xs text-slate-400">{timeAgo(event.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{event.displayText}</p>
        </div>
      </div>

      {/* Reaction bar */}
      <div className="mt-3 flex items-center gap-2">
        {EMOJIS.map((emoji) => {
          const count = event.reactions[emoji] ?? 0;
          const isActive = event.userReaction === emoji;

          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              disabled={reactMutation.isPending}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition ${
                isActive
                  ? 'bg-amber-100 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:ring-amber-700'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span className="text-xs text-slate-600 dark:text-slate-400">{count}</span>
              )}
            </button>
          );
        })}
        {event.totalReactions > 0 && (
          <span className="ml-auto text-xs text-slate-400">
            {event.totalReactions} reaction{event.totalReactions !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.div>
  );
}
