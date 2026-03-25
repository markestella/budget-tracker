'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatRelativeDate } from '@/lib/expense-ui';
import type { ExpenseRecord } from '@/types/expenses';
import { ReceiptText } from 'lucide-react';

export function RecentTransactions({ expenses, isLoading }: { expenses: ExpenseRecord[]; isLoading?: boolean }) {
  return (
    <Card className="h-full rounded-[2rem] border-white/60 bg-white/90 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)] dark:border-slate-800/80 dark:bg-slate-950/85">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest 10 expense records with relative timing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
          ))
        ) : expenses.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            No recent expenses yet.
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <ReceiptText className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-950 dark:text-slate-100">{expense.merchant}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Badge variant="secondary">{expense.category.replaceAll('_', ' ')}</Badge>
                    <span>{formatRelativeDate(expense.date)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(expense.amount)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}