'use client';

import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Swords, Medal, Zap } from 'lucide-react';

const features = [
  { icon: Star, label: 'XP & Leveling', desc: '100 levels of progression. Every financial action earns XP.' },
  { icon: Medal, label: '50+ Badges', desc: 'Unlock achievements for smart money habits and milestones.' },
  { icon: Swords, label: 'Daily Quests', desc: 'Fresh challenges every day — complete them for bonus XP.' },
  { icon: Flame, label: 'Streaks', desc: 'Build daily streaks. Use streak freezes to protect your record.' },
  { icon: Trophy, label: 'Health Score', desc: 'Your financial fitness — rated and tracked over time.' },
  { icon: Zap, label: 'Seasonal Events', desc: 'Time-limited events with 2x XP and exclusive badges.' },
];

export function GamificationSection() {
  return (
    <section id="gamification" className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50 py-24 dark:from-violet-950/30 dark:via-indigo-950/20 dark:to-sky-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-violet-200/60 bg-white/80 p-8 shadow-2xl shadow-violet-500/10 backdrop-blur dark:border-violet-800/40 dark:bg-slate-900/80">
              {/* Mock game profile */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
                  12
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Level 12 — Budget Master</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">4,250 XP</p>
                </div>
              </div>

              {/* XP bar */}
              <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>3,600 / 4,900 XP</span>
                  <span>73%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '73%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                  />
                </div>
              </div>

              {/* Badge row */}
              <div className="flex gap-2">
                {['🏆', '🔥', '💰', '⭐', '🎯', '🧠'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl dark:border-slate-700 dark:bg-slate-800"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>

              {/* Streak */}
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <Flame className="h-6 w-6 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">15 Day Streak!</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Personal best: 23 days</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: copy + feature grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Gamification
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Finance That Feels Like a Game
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Earn XP for every smart money move. Level up, collect badges, maintain streaks, and compete with friends.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 rounded-xl p-3"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
