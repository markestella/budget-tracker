'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { BaseChart, ChartTooltip } from '@/components/charts/BaseChart';

interface SpendingTrendDatum {
  amount: number;
  label: string;
}

interface SpendingTrendChartProps {
  className?: string;
  data?: SpendingTrendDatum[];
}

const placeholderData: SpendingTrendDatum[] = [
  { label: 'Jan', amount: 18500 },
  { label: 'Feb', amount: 21200 },
  { label: 'Mar', amount: 19800 },
  { label: 'Apr', amount: 23500 },
  { label: 'May', amount: 22100 },
  { label: 'Jun', amount: 24750 },
];

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  currency: 'PHP',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function SpendingTrendChart({ className, data = placeholderData }: SpendingTrendChartProps) {
  return (
    <BaseChart
      className={className}
      description="Placeholder trend data for recurring spending insights."
      isEmpty={data.length === 0}
      title="Spending Trend"
    >
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          tickFormatter={(value: number) => currencyFormatter.format(value)}
          tickLine={false}
          width={84}
        />
        <ChartTooltip />
        <Line
          dataKey="amount"
          dot={{ fill: 'var(--chart-1)', r: 4, strokeWidth: 0 }}
          name="Spending"
          stroke="var(--chart-1)"
          strokeLinecap="round"
          strokeWidth={3}
          type="monotone"
        />
      </LineChart>
    </BaseChart>
  );
}