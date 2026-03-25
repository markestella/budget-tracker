'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/expense-ui';

interface CardUsageSummaryProps {
  items: Array<{
    accountId: string;
    accountName: string;
    accountType: string;
    bankName: string;
    totalAmount: number;
    transactionCount: number;
  }>;
}

export function CardUsageSummary({ items }: CardUsageSummaryProps) {
  const chartData = items.map((item) => ({
    name: item.accountName.length > 14 ? `${item.accountName.slice(0, 14)}…` : item.accountName,
    totalAmount: item.totalAmount,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {items.length === 0 ? (
          <Card className="rounded-[2rem] border-dashed">
            <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">
              Link expenses to accounts to unlock per-card insights.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.accountId} className="rounded-[2rem] border-white/60 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/85">
              <CardContent className="p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.bankName}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">{item.accountName}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{formatCurrency(item.totalAmount)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.transactionCount} linked transactions</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="rounded-[2rem] border-white/60 bg-white/90 shadow-[0_22px_70px_-44px_rgba(15,23,42,0.35)] dark:border-slate-800/80 dark:bg-slate-950/85">
        <CardHeader>
          <CardTitle>Spending by Card</CardTitle>
          <CardDescription>Compare how much each linked account is carrying this period.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              No linked account spending to chart yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value: number) => formatCurrency(value)} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} width={84} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="totalAmount" fill="var(--chart-2)" radius={[10, 10, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}