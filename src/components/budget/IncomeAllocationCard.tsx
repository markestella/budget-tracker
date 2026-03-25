'use client';

import { Wallet } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/budget-ui';
import type { BudgetSummary } from '@/types/budgets';

interface IncomeAllocationCardProps {
  summary?: BudgetSummary;
  isLoading?: boolean;
}

export function IncomeAllocationCard({ summary, isLoading }: IncomeAllocationCardProps) {
  const monthlyIncome = summary?.totalMonthlyIncome ?? 0;
  const fixedExpenses = summary?.totalFixedExpenses ?? 0;
  const loanPayments = summary?.totalLoanPayments ?? 0;
  const disposableIncome = summary?.disposableIncome ?? 0;

  return (
    <Card className="overflow-hidden rounded-[2rem] border-none bg-slate-950 text-slate-50 shadow-xl shadow-slate-950/15 dark:bg-slate-50 dark:text-slate-950 dark:shadow-slate-100/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 dark:bg-slate-900/10">
            <Wallet className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-white dark:text-slate-950">Income Allocation</CardTitle>
            <p className="text-sm text-slate-300 dark:text-slate-600">
              Disposable income after recurring obligations.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-2xl bg-white/10 dark:bg-slate-900/10" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-white/8 p-4 dark:bg-slate-900/8">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300 dark:text-slate-500">Monthly Income</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(monthlyIncome)}</p>
              </div>
              <div className="rounded-3xl bg-white/8 p-4 dark:bg-slate-900/8">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300 dark:text-slate-500">Fixed Expenses</p>
                <p className="mt-2 text-2xl font-semibold text-rose-300 dark:text-rose-500">-{formatCurrency(fixedExpenses)}</p>
              </div>
              <div className="rounded-3xl bg-white/8 p-4 dark:bg-slate-900/8">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300 dark:text-slate-500">Loan Payments</p>
                <p className="mt-2 text-2xl font-semibold text-amber-300 dark:text-amber-500">-{formatCurrency(loanPayments)}</p>
              </div>
              <div className="rounded-3xl bg-emerald-400/15 p-4 dark:bg-emerald-500/10">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100 dark:text-emerald-600">Disposable Income</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-200 dark:text-emerald-700">{formatCurrency(disposableIncome)}</p>
              </div>
            </div>
            <Separator className="bg-white/15 dark:bg-slate-900/15" />
            <div className="grid gap-2 text-sm text-slate-300 dark:text-slate-600">
              <div className="flex items-center justify-between">
                <span>Monthly Income</span>
                <span>{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fixed Expenses</span>
                <span>-{formatCurrency(fixedExpenses)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Loan Payments</span>
                <span>-{formatCurrency(loanPayments)}</span>
              </div>
              <Separator className="my-1 bg-white/15 dark:bg-slate-900/15" />
              <div className="flex items-center justify-between text-base font-semibold text-white dark:text-slate-950">
                <span>Disposable Income</span>
                <span>{formatCurrency(disposableIncome)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}