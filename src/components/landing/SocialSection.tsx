'use client';

import { motion } from 'framer-motion';
import { Users, Trophy, MessageSquare, Swords } from 'lucide-react';

const socialFeatures = [
  { icon: Trophy, title: 'Leaderboards', desc: 'Compete on weekly, monthly, and all-time XP rankings. Opt in anytime.' },
  { icon: Users, title: 'Guilds', desc: 'Form teams, set collective goals, and climb guild leaderboards together.' },
  { icon: MessageSquare, title: 'Social Feed', desc: 'Celebrate achievements with your community. React to milestones.' },
  { icon: Swords, title: 'Challenges', desc: 'Monthly community challenges with exclusive rewards for participants.' },
];

export function SocialSection() {
  return (
    <section id="social" className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-24 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Community
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Better With Friends
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Financial wellness is more fun together. Join guilds, compete on leaderboards, and share achievements.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {socialFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center rounded-2xl border border-emerald-200/60 bg-white/80 p-6 text-center shadow-sm backdrop-blur transition-all hover:shadow-md dark:border-emerald-800/40 dark:bg-slate-900/80"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
                  <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
