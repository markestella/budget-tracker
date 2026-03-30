'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "MoneyQuest turned budgeting into something I actually look forward to. The XP system keeps me on track!",
    name: 'Maria Santos',
    role: 'Freelance Designer',
    stars: 5,
  },
  {
    quote: "I saved ₱12,000 in my first three months. The AI suggestions were surprisingly spot-on.",
    name: 'Juan dela Cruz',
    role: 'Software Engineer',
    stars: 5,
  },
  {
    quote: "Our guild competes every month and it's made my whole friend group more financially aware.",
    name: 'Ana Reyes',
    role: 'Marketing Manager',
    stars: 5,
  },
];

const stats = [
  { value: '10K+', label: 'Active users' },
  { value: '₱50M+', label: 'Tracked' },
  { value: '4.8', label: 'App rating' },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Testimonials
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            Loved by Thousands
          </h2>
        </motion.div>

        {/* Stats row */}
        <div className="mb-16 flex flex-wrap justify-center gap-12">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{s.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-4 text-slate-600 dark:text-slate-300">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
