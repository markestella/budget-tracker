'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DashboardMonthlyTrendDatum } from '@/hooks/api/useDashboardHooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return `₱${currencyFormatter.format(value)}`;
}

function formatTooltipValue(
  value: number | string | readonly (number | string)[] | undefined,
  name: string
) {
  const resolvedValue = Array.isArray(value) ? value[0] : value;
  const numericValue =
    typeof resolvedValue === 'number' ? resolvedValue : Number(resolvedValue ?? 0);

  return [formatCurrency(numericValue), name];
}

export function SpendingTrendChart({ data }: { data: DashboardMonthlyTrendDatum[] }) {
  const isEmpty = data.length === 0;

  return (
    <Card className="h-full border-white/60 bg-white/85 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950/85">
      <CardHeader>
        <CardTitle>Spending trend</CardTitle>
        <CardDescription>
          Monthly income versus expenses across the last six months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-72 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            No monthly trend data is available yet.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value: number) => formatCurrency(value)}
                  tickLine={false}
                  width={88}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '1rem',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value, name) => formatTooltipValue(value, String(name))}
                />
                <Legend />
                <Line
                  dataKey="income"
                  dot={{ fill: 'var(--chart-2)', r: 4, strokeWidth: 0 }}
                  name="Income"
                  stroke="var(--chart-2)"
                  strokeLinecap="round"
                  strokeWidth={3}
                  type="monotone"
                />
                <Line
                  dataKey="expenses"
                  dot={{ fill: 'var(--chart-4)', r: 4, strokeWidth: 0 }}
                  name="Expenses"
                  stroke="var(--chart-4)"
                  strokeLinecap="round"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}