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
  Sparkles,
  Banknote,
  Trophy,
  Users,
  Swords,
  Brain,
  Gamepad2,
  ChevronRight,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BudgetHealthBar } from '@/components/dashboard/BudgetHealthBar';
import { OverspendWarning } from '@/components/dashboard/OverspendWarning';
import { BudgetProgressBars } from '@/components/dashboard/charts/BudgetProgressBars';
import { CategoryDonutChart } from '@/components/dashboard/charts/CategoryDonutChart';
import { SpendingTrendChart } from '@/components/dashboard/charts/SpendingTrendChart';
import { FadeIn } from '@/components/animations/FadeIn';
import DailyQuote from '@/components/dashboard/DailyQuote';
import { XPBar } from '@/components/game/XPBar';
import { StreakDisplay } from '@/components/game/StreakDisplay';
import { HealthScoreWidget } from '@/components/game/HealthScoreWidget';
import { QuestPanel } from '@/components/game/QuestPanel';
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
  useDashboardChartsQuery,
  useDashboardQuery,
} from '@/hooks/api/useDashboardHooks';
import { MiniLeaderboardRank } from '@/components/social/MiniLeaderboardRank';
import { ActiveChallengeWidget } from '@/components/social/ActiveChallengeWidget';
import { AIInsightsWidget } from '@/components/ai/AIInsightsWidget';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
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
  href: string;
}

const statConfigs: StatConfig[] = [
  {
    key: 'totalIncomeThisMonth',
    label: 'Income',
    icon: Wallet,
    value: (data) => formatCurrency(data.totalIncomeThisMonth),
    accentClass:
      'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/20',
    href: '/dashboard/income',
  },
  {
    key: 'totalExpensesThisMonth',
    label: 'Expenses',
    icon: ReceiptText,
    value: (data) => formatCurrency(data.totalExpensesThisMonth),
    accentClass:
      'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-300 dark:ring-rose-400/20',
    trendIntent: 'good-when-down',
    href: '/dashboard/expenses',
  },
  {
    key: 'netSavings',
    label: 'Net Savings',
    icon: PiggyBank,
    value: (data) => formatCurrency(data.netSavings),
    accentClass:
      'bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-300 dark:ring-sky-400/20',
    href: '/dashboard/accounts',
  },
  {
    key: 'budgetUsedPercent',
    label: 'Budget Used',
    icon: Target,
    value: (data) => formatPercent(data.budgetUsedPercent),
    accentClass:
      'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-300 dark:ring-amber-400/20',
    trendIntent: 'good-when-down',
    href: '/dashboard/budgets',
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
      <Link href={config.href}>
      <Card className="h-full overflow-hidden border-white/60 bg-white/85 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950/85 transition-shadow hover:shadow-[0_22px_70px_-25px_rgba(15,23,42,0.55)] cursor-pointer">
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
      </Link>
    </FadeIn>
  );
}

function QuickAccessCards() {
  const router = useRouter();
  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {/* Finance Card */}
      <FadeIn delay={0.22}>
        <Link href="/dashboard/budgets">
          <Card className="group h-full border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white/85 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-950/85 transition-all hover:shadow-[0_16px_50px_-15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20 dark:ring-emerald-400/20">
                  <Banknote className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                </div>
                <ChevronRight className="h-5 w-5 text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <CardTitle className="mt-3 text-lg">Finance</CardTitle>
              <CardDescription>Manage budgets, track expenses, and monitor your income all in one place.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </FadeIn>

      {/* MoneyQuest Card */}
      <FadeIn delay={0.26}>
        <div onClick={() => router.push('/dashboard/game')} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') router.push('/dashboard/game'); }}>
          <Card className="group h-full border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white/85 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] dark:border-amber-900/40 dark:from-amber-950/40 dark:to-slate-950/85 transition-all hover:shadow-[0_16px_50px_-15px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-amber-500/10 p-3 ring-1 ring-amber-500/20 dark:ring-amber-400/20">
                  <Gamepad2 className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                </div>
                <ChevronRight className="h-5 w-5 text-amber-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <CardTitle className="mt-3 text-lg">MoneyQuest</CardTitle>
              <CardDescription>Level up your finances with quests, earn XP, and compete on the leaderboard.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Trophy, label: 'Leaderboard', href: '/dashboard/leaderboard' },
                  { icon: Swords, label: 'Challenges', href: '/dashboard/challenges' },
                  { icon: Users, label: 'Guilds', href: '/dashboard/guilds' },
                  { icon: Brain, label: 'Quiz', href: '/dashboard/personality' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200/80 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/40"
                  >
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* AI Insights Card */}
      <FadeIn delay={0.3}>
        <Link href="/dashboard/ai/insights">
          <Card className="group h-full border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white/85 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] dark:border-violet-900/40 dark:from-violet-950/40 dark:to-slate-950/85 transition-all hover:shadow-[0_16px_50px_-15px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 cursor-pointer sm:col-span-2 xl:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-violet-500/10 p-3 ring-1 ring-violet-500/20 dark:ring-violet-400/20">
                  <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                </div>
                <ChevronRight className="h-5 w-5 text-violet-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <CardTitle className="mt-3 text-lg">AI Insights</CardTitle>
              <CardDescription>Smart financial analysis, cash flow predictions, and receipt scanning powered by AI.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </FadeIn>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-4">
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

function ChartsLoadingState() {
  return (
    <>
      <Card className="h-full border-white/60 bg-white/75 dark:border-slate-800/80 dark:bg-slate-950/75">
        <CardHeader className="space-y-3">
          <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </CardHeader>
        <CardContent>
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/80 dark:bg-slate-800/80" />
        </CardContent>
      </Card>
      <Card className="h-full border-white/60 bg-white/75 dark:border-slate-800/80 dark:bg-slate-950/75">
        <CardHeader className="space-y-3">
          <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </CardHeader>
        <CardContent>
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/80 dark:bg-slate-800/80" />
        </CardContent>
      </Card>
    </>
  );
}

function ChartsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 xl:col-span-2">
      <CardHeader>
        <CardTitle>Charts are unavailable</CardTitle>
        <CardDescription>
          The dashboard summary loaded, but the charts dataset could not be fetched.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Retry charts request
        </button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useDashboardQuery();
  const {
    data: chartsData,
    error: chartsError,
    isLoading: chartsLoading,
    refetch: refetchCharts,
  } = useDashboardChartsQuery();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6 md:gap-8">
          <FadeIn className="rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 sm:p-6 md:p-8">
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <XPBar className="flex-1 max-w-md" />
              <StreakDisplay />
            </div>
          </FadeIn>

          {isLoading ? <LoadingDashboard /> : null}
          {!isLoading && error ? <ErrorDashboard onRetry={() => void refetch()} /> : null}

          {!isLoading && data ? (
            <>
              <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-4">
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

              <QuickAccessCards />

              <FadeIn delay={0.26}>
                <BudgetHealthBar
                  budget={data.totalBudgetThisMonth}
                  spent={data.totalExpensesThisMonth}
                />
              </FadeIn>

              <FadeIn delay={0.3}>
                <OverspendWarning
                  budgetUsedPercent={data.budgetUsedPercent}
                  totalBudget={data.totalBudgetThisMonth}
                  totalExpenses={data.totalExpensesThisMonth}
                />
              </FadeIn>

              <FadeIn delay={0.32}>
                <DailyQuote />
              </FadeIn>

              <div className="grid gap-3 sm:gap-4 md:gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                {chartsLoading ? <ChartsLoadingState /> : null}

                {!chartsLoading && chartsError ? (
                  <ChartsErrorState onRetry={() => void refetchCharts()} />
                ) : null}

                {!chartsLoading && chartsData ? (
                  <>
                    <FadeIn delay={0.32}>
                      <SpendingTrendChart data={chartsData.monthlyTrend} />
                    </FadeIn>

                    <FadeIn delay={0.4}>
                      <CategoryDonutChart data={chartsData.categoryBreakdown} />
                    </FadeIn>
                  </>
                ) : null}
              </div>

              {!chartsLoading && chartsData ? (
                <FadeIn delay={0.48}>
                  <BudgetProgressBars data={chartsData.budgetProgress} />
                </FadeIn>
              ) : null}

              <div className="grid gap-3 sm:gap-4 md:gap-6 xl:grid-cols-2">
                <FadeIn delay={0.52}>
                  <ErrorBoundary>
                    <HealthScoreWidget />
                  </ErrorBoundary>
                </FadeIn>
                <FadeIn delay={0.56}>
                  <ErrorBoundary>
                    <QuestPanel />
                  </ErrorBoundary>
                </FadeIn>
              </div>

              <div className="grid gap-3 sm:gap-4 md:gap-6 xl:grid-cols-2">
                <FadeIn delay={0.6}>
                  <ErrorBoundary>
                    <MiniLeaderboardRank />
                  </ErrorBoundary>
                </FadeIn>
                <FadeIn delay={0.64}>
                  <ErrorBoundary>
                    <ActiveChallengeWidget />
                  </ErrorBoundary>
                </FadeIn>
              </div>

              <FadeIn delay={0.68}>
                <ErrorBoundary>
                  <AIInsightsWidget />
                </ErrorBoundary>
              </FadeIn>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}