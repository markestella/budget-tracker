'use client';

import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  ReceiptText,
  Target,
  Wallet,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FadeIn } from '@/components/animations/FadeIn';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  type DashboardSummary,
  type DashboardTrend,
  useDashboardQuery,
} from '@/hooks/api/useDashboardHooks';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatCurrency(value: number) {
  return `₱${currencyFormatter.format(value)}`;
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

interface StatConfig {
  key: keyof DashboardSummary['trends'];
  label: string;
  icon: LucideIcon;
  value: (data: DashboardSummary) => string;
  accentClass: string;
  trendIntent?: 'good-when-up' | 'good-when-down';
}

const statConfigs: StatConfig[] = [
  {
    key: 'totalIncomeThisMonth',
    label: 'Income',
    icon: Wallet,
    value: (data) => formatCurrency(data.totalIncomeThisMonth),
    accentClass:
      'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/20',
  },
  {
    key: 'totalExpensesThisMonth',
    label: 'Expenses',
    icon: ReceiptText,
    value: (data) => formatCurrency(data.totalExpensesThisMonth),
    accentClass:
      'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-300 dark:ring-rose-400/20',
    trendIntent: 'good-when-down',
  },
  {
    key: 'netSavings',
    label: 'Net Savings',
    icon: PiggyBank,
    value: (data) => formatCurrency(data.netSavings),
    accentClass:
      'bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-300 dark:ring-sky-400/20',
  },
  {
    key: 'budgetUsedPercent',
    label: 'Budget Used',
    icon: Target,
    value: (data) => formatPercent(data.budgetUsedPercent),
    accentClass:
      'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-300 dark:ring-amber-400/20',
    trendIntent: 'good-when-down',
  },
];

function getTrendTone(trend: DashboardTrend, intent: StatConfig['trendIntent']) {
  if (trend.direction === 'flat') {
    return 'text-slate-500 dark:text-slate-400';
  }

  const isGood =
    intent === 'good-when-down'
      ? trend.direction === 'down'
      : trend.direction === 'up';

  return isGood
    ? 'text-emerald-600 dark:text-emerald-300'
    : 'text-rose-600 dark:text-rose-300';
}

function StatCard({
  config,
  trend,
  value,
  delay,
}: {
  config: StatConfig;
  trend: DashboardTrend;
  value: string;
  delay: number;
}) {
  const Icon = config.icon;
  const TrendIcon =
    trend.direction === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <FadeIn delay={delay}>
      <Card className="h-full overflow-hidden border-white/60 bg-white/85 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950/85">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div className="space-y-1">
            <CardDescription>{config.label}</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {value}
            </CardTitle>
          </div>
          <div className={cn('rounded-2xl p-3', config.accentClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <span className={cn('inline-flex items-center gap-1 font-medium', getTrendTone(trend, config.trendIntent))}>
              {trend.direction === 'flat' ? (
                <span className="inline-block h-2 w-2 rounded-full bg-current" />
              ) : (
                <TrendIcon className="h-4 w-4" />
              )}
              {trend.direction === 'flat'
                ? 'No change'
                : `${percentFormatter.format(trend.percentage)}%`}
            </span>
            <span className="text-slate-500 dark:text-slate-400">vs last month</span>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function LoadingDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-white/60 bg-white/75 dark:border-slate-800/80 dark:bg-slate-950/75">
          <CardHeader className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorDashboard({ onRetry }: { onRetry: () => void }) {
  return (
    <FadeIn>
      <Card className="border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30">
        <CardHeader>
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-300">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Dashboard data is unavailable</CardTitle>
          </div>
          <CardDescription>
            The overview could not be loaded from the protected dashboard API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Retry request
          </button>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, error, isLoading, refetch } = useDashboardQuery();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <FadeIn className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 sm:p-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
                  Financial snapshot
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                  Here&apos;s your month-to-date overview across income, expenses, savings, and budget usage.
                </p>
              </div>
              <div className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                {formatCurrentDate()}
              </div>
            </div>
          </FadeIn>

          {isLoading ? <LoadingDashboard /> : null}
          {!isLoading && error ? <ErrorDashboard onRetry={() => void refetch()} /> : null}

          {!isLoading && data ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {statConfigs.map((config, index) => (
                  <StatCard
                    key={config.key}
                    config={config}
                    trend={data.trends[config.key]}
                    value={config.value(data)}
                    delay={0.06 * (index + 1)}
                  />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <FadeIn delay={0.32}>
                  <Card className="h-full border-dashed border-slate-300/80 bg-white/80 dark:border-slate-700 dark:bg-slate-950/80">
                    <CardHeader>
                      <CardTitle>Spending trend chart</CardTitle>
                      <CardDescription>
                        Placeholder area for the time-series chart coming next. The layout is ready for a monthly income-versus-expense visualization.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-72 items-end gap-3 rounded-[1.75rem] border border-dashed border-slate-300/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-900/50">
                        {['W1', 'W2', 'W3', 'W4', 'W5'].map((label, index) => (
                          <div key={label} className="flex flex-1 flex-col items-center justify-end gap-3">
                            <div
                              className="w-full rounded-t-2xl bg-gradient-to-t from-sky-500/20 to-sky-500/50"
                              style={{ height: `${32 + index * 12}%` }}
                            />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                <FadeIn delay={0.4}>
                  <Card className="h-full border-dashed border-slate-300/80 bg-white/80 dark:border-slate-700 dark:bg-slate-950/80">
                    <CardHeader>
                      <CardTitle>Category breakdown</CardTitle>
                      <CardDescription>
                        Placeholder section for the spending-category chart. Current top categories are listed so the next chart component has real dashboard data to build from.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.topCategories.length > 0 ? (
                        data.topCategories.map((category, index) => (
                          <div
                            key={category.category}
                            className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-950 dark:text-slate-100">
                                {index + 1}. {category.category}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Chart placeholder data source
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {formatCurrency(category.amount)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1.75rem] border border-dashed border-slate-300/80 bg-slate-50/80 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                          No spending categories for this month yet. The chart placeholder will populate when expense records are available.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}