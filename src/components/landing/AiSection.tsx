'use client';

import { motion } from 'framer-motion';
import { Bot, Lightbulb, Camera, LineChart } from 'lucide-react';

const capabilities = [
  {
    icon: Bot,
    title: 'AI Chat Assistant',
    description: 'Ask anything about your finances. The AI knows your spending patterns and gives context-aware advice.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Suggestions',
    description: 'Get personalized budget recommendations based on your historical spending patterns.',
  },
  {
    icon: Camera,
    title: 'Receipt Scanner',
    description: 'Snap a photo of any receipt. AI extracts merchant, items, and total — auto-fills your expense.',
  },
  {
    icon: LineChart,
    title: 'Cash Flow Forecast',
    description: 'Predictive cash flow analysis shows where your money is headed over the next 30, 60, 90 days.',
  },
];

export function AiSection() {
  return (
    <section id="ai" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            AI-Powered
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Your Personal Finance AI
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Powered by Gemini AI — smart insights, pattern detection, and a chat assistant that understands your money.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex gap-5 rounded-2xl border border-slate-200/60 bg-white/80 p-6 transition-all hover:border-sky-200/60 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/80 dark:hover:border-sky-800/60"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 transition-colors group-hover:bg-sky-200 dark:bg-sky-950/50 dark:group-hover:bg-sky-900/50">
                  <Icon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {cap.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {cap.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
