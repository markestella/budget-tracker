'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useHealthScoreQuery } from '@/hooks/api/useHealthScore';

const tierConfig: Record<string, { color: string; bg: string; label: string }> = {
  EXCELLENT: { color: 'text-emerald-500', bg: 'stroke-emerald-500', label: 'Excellent' },
  GOOD: { color: 'text-blue-500', bg: 'stroke-blue-500', label: 'Good' },
  FAIR: { color: 'text-amber-500', bg: 'stroke-amber-500', label: 'Fair' },
  NEEDS_WORK: { color: 'text-orange-500', bg: 'stroke-orange-500', label: 'Needs Work' },
  CRITICAL: { color: 'text-red-500', bg: 'stroke-red-500', label: 'Critical' },
};

const componentLabels: Record<string, string> = {
  budget: 'Budget Adherence',
  savings: 'Savings Rate',
  emergency: 'Emergency Fund',
  debt: 'Debt Management',
  consistency: 'Consistency',
};

function CircularGauge({ score, tier }: { score: number; tier: string }) {
  const config = tierConfig[tier] ?? tierConfig.FAIR;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className={config.bg}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-2xl font-bold', config.color)}>{score}</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' | null }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

export function HealthScoreWidget({ className }: { className?: string }) {
  const { data, isLoading } = useHealthScoreQuery();

  if (isLoading || !data) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = tierConfig[data.tier] ?? tierConfig.FAIR;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Financial Health
            <TrendIcon trend={data.trend} />
          </CardTitle>
          <span className={cn('text-sm font-medium', config.color)}>
            {data.tierEmoji} {config.label}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <CircularGauge score={data.score} tier={data.tier} />

          <div className="w-full space-y-2">
            {Object.entries(data.components).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {componentLabels[key] ?? key}
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    className={cn('absolute inset-y-0 left-0 rounded-full', {
                      'bg-emerald-500': value >= 70,
                      'bg-amber-500': value >= 40 && value < 70,
                      'bg-red-500': value < 40,
                    })}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
