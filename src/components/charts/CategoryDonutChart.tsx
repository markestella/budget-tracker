'use client';

import { Cell, Pie, PieChart } from 'recharts';

import { BaseChart, ChartTooltip, chartPalette } from '@/components/charts/BaseChart';

interface CategoryDonutDatum {
  name: string;
  value: number;
}

interface CategoryDonutChartProps {
  className?: string;
  data?: CategoryDonutDatum[];
}

const placeholderData: CategoryDonutDatum[] = [
  { name: 'Bills', value: 32000 },
  { name: 'Groceries', value: 14500 },
  { name: 'Transport', value: 7600 },
  { name: 'Savings', value: 19800 },
];

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  currency: 'PHP',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function CategoryDonutChart({ className, data = placeholderData }: CategoryDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <BaseChart
      className={className}
      description="Placeholder category mix for budget and expense storytelling."
      footer={
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total tracked</span>
          <span className="font-semibold text-foreground">{currencyFormatter.format(total)}</span>
        </div>
      }
      isEmpty={data.length === 0}
      title="Category Mix"
    >
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="value"
          innerRadius={68}
          nameKey="name"
          outerRadius={100}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell fill={chartPalette[index % chartPalette.length]} key={`${entry.name}-${entry.value}`} />
          ))}
        </Pie>
        <ChartTooltip />
      </PieChart>
    </BaseChart>
  );
}