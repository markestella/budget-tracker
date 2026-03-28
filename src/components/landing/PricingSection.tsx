'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';

const plans = [
  {
    name: 'Free',
    price: '₱0',
    period: '/month',
    description: 'Everything you need to start tracking.',
    features: ['Track expenses', 'Set budgets', 'Manage income', 'XP & leveling', 'Basic quests'],
    cta: 'Get Started',
    variant: 'outline' as const,
    href: '/register',
  },
  {
    name: 'Premium',
    price: '₱199',
    period: '/month',
    description: 'Power features for serious savers.',
    features: ['All Free features', 'AI Insights & Chat', 'PDF/CSV Export', 'Savings goals', 'Priority support'],
    cta: 'Start Free Trial',
    variant: 'primary' as const,
    href: '/register',
    popular: true,
  },
  {
    name: 'Pro',
    price: '₱499',
    period: '/month',
    description: 'For teams and advanced planning.',
    features: ['All Premium features', 'Smart Analytics', 'Multi-user sync', 'Guild creation', 'API access'],
    cta: 'Contact Sales',
    variant: 'outline' as const,
    href: '/register',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-50 py-24 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Choose the Plan That Fits You
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Start free, upgrade when you&apos;re ready.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-lg ${
                plan.popular
                  ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 dark:bg-slate-800'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="ml-1 text-slate-500 dark:text-slate-400">{plan.period}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="mt-8 block">
                <Button variant={plan.variant} size="lg" className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
