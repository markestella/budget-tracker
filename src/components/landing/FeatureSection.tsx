'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  BarChart3,
  PiggyBank,
  CreditCard,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

const features = [
  {
    icon: Wallet,
    title: 'Income Tracking',
    description: 'Track multiple income sources, recurring payments, and monitor cash flow patterns with real-time updates.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
  {
    icon: Receipt,
    title: 'Expense Management',
    description: 'Quick-add expenses, auto-categorize transactions, and scan receipts with AI-powered OCR.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-950/50',
  },
  {
    icon: BarChart3,
    title: 'Budget Analytics',
    description: 'Set category budgets, track progress with visual bars, and get alerts when approaching limits.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950/50',
  },
  {
    icon: PiggyBank,
    title: 'Savings Goals',
    description: 'Create savings goals with progress rings, track growth over time, and celebrate milestones.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-950/50',
  },
  {
    icon: CreditCard,
    title: 'Account Management',
    description: 'Link financial accounts, track card spending, and see a unified view of your money.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-950/50',
  },
  {
    icon: TrendingUp,
    title: 'Financial Reports',
    description: 'Interactive charts, spending trends, category breakdowns, and exportable data (CSV, JSON, PDF).',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-950/50',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeatureSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Core Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything You Need to Manage Money
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Powerful financial tools wrapped in a beautiful, intuitive interface.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={itemVariants}>
                <Card className="group h-full border-slate-200/60 bg-white/80 transition-all hover:border-violet-300/60 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/80 dark:hover:border-violet-700/60">
                  <CardHeader className="pb-3">
                    <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
