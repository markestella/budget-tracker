'use client';

import type { CSSProperties, ReactNode } from 'react';

import { ResponsiveContainer, Tooltip } from 'recharts';

import { cn } from '@/lib/utils';

export const chartPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

interface ChartTooltipPayload {
  color?: string;
  dataKey?: string;
  name?: string;
  value?: number | string;
}

interface BaseChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: ChartTooltipPayload[];
}

interface BaseChartProps {
  children: ReactNode;
  className?: string;
  description?: string;
  emptyMessage?: string;
  footer?: ReactNode;
  height?: number;
  isEmpty?: boolean;
  title: string;
}

const chartSurfaceStyle: CSSProperties = {
  backgroundColor: 'color-mix(in oklab, var(--card) 96%, transparent)',
  borderColor: 'color-mix(in oklab, var(--border) 88%, transparent)',
};

export function BaseChartTooltip({ active, label, payload }: BaseChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="min-w-40 rounded-2xl border px-3 py-2 shadow-lg backdrop-blur"
      style={{
        backgroundColor: 'color-mix(in oklab, var(--card) 92%, transparent)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
      }}
    >
      {label ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p> : null}
      <div className="space-y-1.5 text-sm">
        {payload.map((item) => (
          <div className="flex items-center justify-between gap-3" key={`${item.dataKey ?? item.name}-${item.value}`}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color ?? 'var(--chart-1)' }}
              />
              <span>{item.name ?? item.dataKey}</span>
            </div>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BaseChart({
  children,
  className,
  description,
  emptyMessage = 'No data available yet.',
  footer,
  height = 280,
  isEmpty = false,
  title,
}: BaseChartProps) {
  return (
    <section
      className={cn('rounded-3xl border p-5 shadow-sm', className)}
      style={chartSurfaceStyle}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/25 px-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer height="100%" width="100%">
            <>{children}</>
          </ResponsiveContainer>
        </div>
      )}

      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}

export function ChartTooltip() {
  return <Tooltip content={<BaseChartTooltip />} cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }} />;
}