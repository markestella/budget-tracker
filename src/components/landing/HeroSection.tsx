'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Target,
  Sparkles,
  Trophy,
} from 'lucide-react';
import Button from '@/components/ui/Button';

const floatingStats = [
  { label: 'Income', value: '₱45,000', icon: Wallet, color: 'from-emerald-500 to-teal-600' },
  { label: 'Expenses', value: '₱28,500', icon: TrendingUp, color: 'from-rose-500 to-pink-600' },
  { label: 'Savings', value: '₱16,500', icon: PiggyBank, color: 'from-sky-500 to-blue-600' },
  { label: 'Level 12', value: '4,250 XP', icon: Trophy, color: 'from-amber-500 to-orange-600' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
              Finance meets gamification
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Level Up Your{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Financial Life
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              MoneyQuest turns budgeting into an adventure. Track expenses, earn XP, unlock badges,
              compete on leaderboards, and get AI-powered insights — all in one app.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700 sm:w-auto">
                  Start Free
                </Button>
              </Link>
              <Link href="/dashboard?demo=true">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Target className="mr-2 h-4 w-4" />
                  Try Demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">✓ Free forever plan</span>
              <span className="flex items-center gap-1.5">✓ No credit card</span>
              <span className="flex items-center gap-1.5">✓ PWA installable</span>
            </div>
          </motion.div>

          {/* Right: floating stat cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto h-[420px] w-full max-w-md">
              {floatingStats.map((stat, i) => {
                const Icon = stat.icon;
                const positions = [
                  'top-0 left-4',
                  'top-8 right-0',
                  'bottom-16 left-0',
                  'bottom-0 right-8',
                ];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                    className={`absolute ${positions[i]} w-52 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/90`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      </div>
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
