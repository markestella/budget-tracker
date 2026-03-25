'use client';

import { useState } from 'react';
import { Edit3, Landmark, Plus, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateEarlyPayoff, getDurationMetrics, groupBudgetItemsByCategory } from '@/lib/budget-ui';
import type { BudgetItem } from '@/types/budgets';

interface ConstantExpensesSectionProps {
  items: BudgetItem[];
  onAdd: () => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
}

interface DurationExpensesSectionProps {
  items: BudgetItem[];
  onAdd: () => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
  onMarkPaid: (item: BudgetItem) => void;
  isMarkingPaid?: boolean;
}

function SectionEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300/80 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {message}
    </div>
  );
}

export function ConstantExpensesSection({ items, onAdd, onDelete, onEdit }: ConstantExpensesSectionProps) {
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const groups = groupBudgetItemsByCategory(items);

  return (
    <Card className="rounded-[2rem]">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Constant Expenses (Recurring)</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track always-on monthly obligations grouped by category.
          </p>
        </div>
        <Button onClick={onAdd} size="sm">
          <Plus className="size-4" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.length === 0 ? (
          <SectionEmptyState message="No recurring constant expenses yet. Add utilities, rent, subscriptions, or other fixed monthly obligations." />
        ) : (
          groups.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {group.categoryLabel}
                </h3>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {formatCurrency(group.items.reduce((sum, item) => sum + Number(item.amount), 0))}
                </span>
              </div>
              <div className="grid gap-3">
                {group.items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.description}</p>
                          {!item.isActive ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              Inactive
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Due every month on day {item.dueDate}
                          {item.merchant ? ` · ${item.merchant}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.amount)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Monthly</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                            <Edit3 className="size-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onDelete(item)}>
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white dark:bg-slate-100 dark:text-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-sm uppercase tracking-[0.18em] text-slate-300 dark:text-slate-600">Monthly Total</span>
            <span className="text-2xl font-semibold">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DurationExpenseItemCard({
  item,
  onDelete,
  onEdit,
  onMarkPaid,
  isMarkingPaid,
}: {
  item: BudgetItem;
  onDelete: (item: BudgetItem) => void;
  onEdit: (item: BudgetItem) => void;
  onMarkPaid: (item: BudgetItem) => void;
  isMarkingPaid?: boolean;
}) {
  const [extraPayment, setExtraPayment] = useState('0');
  const metrics = getDurationMetrics(item);
  const payoff = calculateEarlyPayoff(item, Number(extraPayment));

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-slate-500 dark:text-slate-400" />
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.description}</p>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {item.merchant ? `${item.merchant} · ` : ''}
              Due on day {item.dueDate}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div className="space-y-2">
              <Progress value={metrics.percentPaid} className="gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {metrics.completedPayments}/{metrics.totalMonths} payments ({metrics.percentPaid}%)
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {formatCurrency(metrics.monthlyAmount)}/month
                  </span>
                </div>
              </Progress>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span>{metrics.remainingMonths} months</span>
                <span>·</span>
                <span>{formatCurrency(metrics.remainingDebt)} remaining</span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
              <Input
                label="Extra / month"
                type="number"
                min="0"
                step="0.01"
                value={extraPayment}
                onChange={(event) => setExtraPayment(event.target.value)}
              />
              <Button
                onClick={() => onMarkPaid(item)}
                disabled={metrics.remainingMonths === 0}
                isLoading={isMarkingPaid}
              >
                Mark Paid
              </Button>
            </div>
          </div>

          <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200/80 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
            If you pay <strong>{formatCurrency(Number(extraPayment) || 0)}</strong> extra/month, you&apos;ll finish <strong>{payoff.monthsEarly}</strong> months early.
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
            <Edit3 className="size-4" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(item)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DurationExpensesSection({
  items,
  onAdd,
  onDelete,
  onEdit,
  onMarkPaid,
  isMarkingPaid,
}: DurationExpensesSectionProps) {
  const monthlyTotal = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRemainingDebt = items.reduce((sum, item) => sum + getDurationMetrics(item).remainingDebt, 0);
  const groups = groupBudgetItemsByCategory(items);

  return (
    <Card className="rounded-[2rem]">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Duration Expenses (Loans & Installments)</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monitor progress on installment plans and loan repayments.
          </p>
        </div>
        <Button onClick={onAdd} size="sm">
          <Plus className="size-4" />
          Add Loan
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.length === 0 ? (
          <SectionEmptyState message="No duration expenses yet. Add loans, gadget installments, or other time-bound obligations to track payment progress." />
        ) : (
          groups.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {group.categoryLabel}
                </h3>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {formatCurrency(group.items.reduce((sum, item) => sum + Number(item.amount), 0))}/month
                </span>
              </div>
              <div className="grid gap-3">
                {group.items.map((item) => (
                  <DurationExpenseItemCard
                    key={item.id}
                    item={item}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onMarkPaid={onMarkPaid}
                    isMarkingPaid={isMarkingPaid}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white dark:bg-slate-100 dark:text-slate-950">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300 dark:text-slate-600">Monthly Loan Total</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(monthlyTotal)}</p>
          </div>
          <div className="rounded-3xl bg-amber-100 px-5 py-4 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Total Remaining Debt</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalRemainingDebt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}