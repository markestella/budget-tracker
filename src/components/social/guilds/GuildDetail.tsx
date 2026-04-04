'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  useGuildDetailQuery,
  useGuildLeaderboardQuery,
  useLeaveGuildMutation,
  useSendGuildMessageMutation,
} from '@/hooks/api/useGuildHooks';
import { useDemoGuard } from '@/hooks/useDemoGuard';

interface GuildDetailProps {
  guildId: string;
  onBack: () => void;
}

export function GuildDetail({ guildId, onBack }: GuildDetailProps) {
  const [tab, setTab] = useState<'chat' | 'members' | 'leaderboard' | 'challenges'>('chat');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: guild, isLoading } = useGuildDetailQuery(guildId);
  const { data: rankings } = useGuildLeaderboardQuery(guildId);
  const leaveMutation = useLeaveGuildMutation();
  const sendMsg = useSendGuildMessageMutation(guildId);
  const guardMutation = useDemoGuard();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guild?.messages]);

  if (isLoading || !guild) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const handleSend = () => {
    if (!guardMutation()) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMsg.mutate(trimmed);
    setMessage('');
  };

  const tabs = ['chat', 'members', 'leaderboard', 'challenges'] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-amber-600 hover:underline dark:text-amber-400">
            ← Back to guilds
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{guild.name}</h2>
          {guild.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{guild.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>👥 {guild.members.length}/{guild.maxMembers}</span>
            <span>🔑 {guild.inviteCode}</span>
            <span className="capitalize">{guild.myRole.toLowerCase()}</span>
          </div>
        </div>
        {guild.myRole !== 'OWNER' && (
          <button
            onClick={() => { if (!guardMutation()) return; leaveMutation.mutate(guildId); }}
            disabled={leaveMutation.isPending}
            className="rounded-lg px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            Leave
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80"
      >
        {tab === 'chat' && (
          <div className="flex flex-col gap-3">
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {guild.messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No messages yet. Say hello! 👋</p>
              ) : (
                guild.messages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {msg.userName}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{msg.content}</span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                maxLength={500}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={sendMsg.isPending || !message.trim()}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="space-y-2">
            {guild.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{m.name}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.role === 'OWNER'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : m.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="space-y-1">
            {rankings?.map((r) => (
              <div key={r.userId} className="flex items-center justify-between rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-amber-600 dark:text-amber-400">
                    {r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : `#${r.rank}`}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{r.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{r.xp.toLocaleString()} XP</span>
                  <span className="ml-2 text-xs text-slate-400">Lv.{r.level}</span>
                </div>
              </div>
            )) ?? <p className="py-4 text-center text-sm text-slate-400">No rankings yet</p>}
          </div>
        )}

        {tab === 'challenges' && (
          <div className="space-y-3">
            {guild.challenges.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No active challenges</p>
            ) : (
              guild.challenges.map((c) => (
                <div key={c.id} className="rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-4 dark:from-amber-950/20 dark:to-orange-950/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 dark:text-white">{c.title}</h4>
                    <span className="text-xs text-amber-600 dark:text-amber-400">+{c.xpReward} XP</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                      style={{ width: `${Math.min(100, (c.currentValue / c.targetValue) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {c.currentValue} / {c.targetValue} • {c.targetType.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
