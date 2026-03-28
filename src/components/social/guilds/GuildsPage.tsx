'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMyGuildsQuery, useGuildDiscoverQuery, useJoinGuildMutation } from '@/hooks/api/useGuildHooks';
import { GuildCard } from './GuildCard';
import { GuildDetail } from './GuildDetail';
import { CreateGuildDialog, JoinGuildDialog } from './GuildDialogs';

export function GuildsPage() {
  const [tab, setTab] = useState<'mine' | 'discover'>('mine');
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinGuildId, setJoinGuildId] = useState<string>();
  const [discoverPage, setDiscoverPage] = useState(1);

  const { data: myGuilds, isLoading: myLoading } = useMyGuildsQuery();
  const { data: discover, isLoading: discoverLoading } = useGuildDiscoverQuery(discoverPage);
  const joinMutation = useJoinGuildMutation();

  if (selectedGuildId) {
    return <GuildDetail guildId={selectedGuildId} onBack={() => setSelectedGuildId(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
        >
          + Create Guild
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(['mine', 'discover'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {t === 'mine' ? 'My Guilds' : 'Discover'}
          </button>
        ))}
      </div>

      {tab === 'mine' && (
        <motion.div
          key="mine"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {myLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : !myGuilds?.length ? (
            <div className="py-12 text-center">
              <span className="text-4xl">🏰</span>
              <p className="mt-3 text-slate-500 dark:text-slate-400">No guilds yet. Create or join one!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myGuilds.map((g) => (
                <GuildCard key={g.id} guild={g} onClick={() => setSelectedGuildId(g.id)} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {tab === 'discover' && (
        <motion.div
          key="discover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {discoverLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : !discover?.guilds.length ? (
            <div className="py-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">No public guilds found</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {discover.guilds.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{g.name}</h3>
                    {g.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{g.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        👥 {g.memberCount}/{g.maxMembers}
                      </span>
                      {g.isMember ? (
                        <span className="text-xs text-green-600 dark:text-green-400">Already joined</span>
                      ) : (
                        <button
                          onClick={() => joinMutation.mutate({ guildId: g.id })}
                          disabled={joinMutation.isPending}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {discover.totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => setDiscoverPage(Math.max(1, discoverPage - 1))}
                    disabled={discoverPage === 1}
                    className="rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                  >
                    ← Prev
                  </button>
                  <span className="flex items-center text-sm text-slate-500">
                    {discover.page} / {discover.totalPages}
                  </span>
                  <button
                    onClick={() => setDiscoverPage(Math.min(discover.totalPages, discoverPage + 1))}
                    disabled={discoverPage >= discover.totalPages}
                    className="rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      <CreateGuildDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinGuildDialog open={showJoin} onClose={() => setShowJoin(false)} guildId={joinGuildId} />
    </div>
  );
}
