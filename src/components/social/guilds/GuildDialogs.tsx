'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateGuildMutation, useJoinGuildMutation } from '@/hooks/api/useGuildHooks';

export function CreateGuildDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const mutation = useCreateGuildMutation();

  const handleSubmit = () => {
    if (name.length < 3) return;
    mutation.mutate(
      { name, description: description || undefined, isPublic },
      {
        onSuccess: () => {
          onClose();
          setName('');
          setDescription('');
          setIsPublic(false);
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Create Guild</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="My Awesome Guild"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="What's your guild about?"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-slate-700 dark:text-slate-300">Make guild public (discoverable)</span>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending || name.length < 3}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-medium text-white shadow transition hover:shadow-md disabled:opacity-50"
              >
                {mutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function JoinGuildDialog({ open, onClose, guildId }: { open: boolean; onClose: () => void; guildId?: string }) {
  const [inviteCode, setInviteCode] = useState('');
  const mutation = useJoinGuildMutation();

  const handleJoin = () => {
    if (!guildId) return;
    mutation.mutate(
      { guildId, inviteCode: inviteCode || undefined },
      {
        onSuccess: () => {
          onClose();
          setInviteCode('');
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/60 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Join Guild</h3>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Invite Code (for private guilds)</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                maxLength={8}
                placeholder="Enter 8-character code"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={mutation.isPending}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-medium text-white shadow transition hover:shadow-md disabled:opacity-50"
              >
                {mutation.isPending ? 'Joining...' : 'Join'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
