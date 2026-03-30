'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { DashboardCategoryBreakdownDatum } from '@/hooks/api/useDashboardHooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

function formatCurrency(value: number) {
  return `₱${currencyFormatter.format(value)}`;
}

function formatTooltipValue(
  value: number | string | readonly (number | string)[] | undefined
) {
  const resolvedValue = Array.isArray(value) ? value[0] : value;
  const numericValue =
    typeof resolvedValue === 'number' ? resolvedValue : Number(resolvedValue ?? 0);

  return formatCurrency(numericValue);
}

export function CategoryDonutChart({
  data,
}: {
  data: DashboardCategoryBreakdownDatum[];
}) {
  const totalSpent = data.reduce((sum, item) => sum + item.amount, 0);
  const isEmpty = data.length === 0;

  return (
    <Card className="h-full border-white/60 bg-white/85 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950/85">
      <CardHeader>
        <CardTitle>Category breakdown</CardTitle>
        <CardDescription>
          Current-month expense mix by category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isEmpty ? (
          <div className="flex h-48 sm:h-56 md:h-64 lg:h-72 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            No category spending data is available yet.
          </div>
        ) : (
          <>
            <div className="relative h-48 sm:h-56 md:h-64 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={data}
                    dataKey="amount"
                    innerRadius={72}
                    outerRadius={106}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        fill={chartColors[index % chartColors.length]}
                        key={`${entry.category}-${entry.amount}`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '1rem',
                      color: 'var(--foreground)',
                    }}
                    formatter={(value) => formatTooltipValue(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Total spent
                </span>
                <span className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {data.map((entry, index) => (
                <div
                  key={`${entry.category}-${entry.amount}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-950 dark:text-slate-100">
                        {entry.category}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {entry.percentage}% of monthly spending
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {formatCurrency(entry.amount)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}