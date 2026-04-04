'use client';

import { startTransition, Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { CardUsageSummary } from '@/components/expense/CardUsageSummary';
import { ExpenseFilterBar } from '@/components/expense/ExpenseFilterBar';
import { ExpenseFormDialog } from '@/components/expense/ExpenseFormDialog';
import { QuickAddExpense } from '@/components/expense/QuickAddExpense';
import { RecentTransactions } from '@/components/expense/RecentTransactions';
import { TransactionHistory } from '@/components/expense/TransactionHistory';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { useAccountsQuery } from '@/hooks/api/useAccountHooks';
import { useBudgetItemsQuery } from '@/hooks/api/useBudgetHooks';
import { useDemoGuard } from '@/hooks/useDemoGuard';
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useExpensesQuery,
  useRecentExpensesQuery,
  useUpdateExpenseMutation,
} from '@/hooks/api/useExpenseHooks';
import { buildExpenseSearchParams, formatCurrency, readExpenseFilters } from '@/lib/expense-ui';
import type { ExpenseFilters, ExpensePayload, ExpenseRecord } from '@/types/expenses';

const initialExpensePayload = (): ExpensePayload => ({
  amount: 0,
  category: 'FOOD_DINING',
  date: new Date().toISOString().split('T')[0],
  merchant: '',
});

function ExpensesPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = readExpenseFilters(new URLSearchParams(searchParams.toString()));
  const searchFromFilters = filters.search ?? '';
  const [searchValue, setSearchValue] = useState(searchFromFilters);
  const [searchDirty, setSearchDirty] = useState(false);
  const [quickAddValues, setQuickAddValues] = useState<ExpensePayload>(initialExpensePayload);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  const { accountsQuery } = useAccountsQuery();
  const budgetItemsQuery = useBudgetItemsQuery();
  const expensesQuery = useExpensesQuery(filters);
  const recentExpensesQuery = useRecentExpensesQuery();
  const createExpenseMutation = useCreateExpenseMutation(filters);
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();
  const guardMutation = useDemoGuard();

  useEffect(() => {
    if (!searchDirty) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const normalizedSearch = searchValue.trim();

      if (searchFromFilters === normalizedSearch) {
        setSearchDirty(false);
        return;
      }

      const nextFilters: ExpenseFilters = {
        ...filters,
        page: 1,
        search: normalizedSearch || undefined,
      };
      const nextSearchParams = buildExpenseSearchParams(nextFilters);

      startTransition(() => {
        router.replace(nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname, {
          scroll: false,
        });
      });

      setSearchDirty(false);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters, pathname, router, searchDirty, searchFromFilters, searchValue]);

  const accounts = accountsQuery.data ?? [];
  const budgetItems = budgetItemsQuery.data ?? [];
  const expenseList = expensesQuery.data;
  const expenses = expenseList?.data ?? [];
  const recentExpenses = recentExpensesQuery.data ?? [];
  const summaries = expenseList?.summaries;

  const stats = useMemo(() => {
    const totalAmount = summaries?.totalAmount ?? 0;
    const totalCount = expenseList?.totalCount ?? 0;
    const linkedCards = summaries?.accountUsage.length ?? 0;
    const average = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      average,
      linkedCards,
      totalAmount,
      totalCount,
    };
  }, [expenseList?.totalCount, summaries]);

  function applyFilters(nextFilters: ExpenseFilters) {
    const nextSearchParams = buildExpenseSearchParams(nextFilters);

    startTransition(() => {
      router.replace(nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname, {
        scroll: false,
      });
    });
  }

  function handleSearchValueChange(value: string) {
    setSearchDirty(true);
    setSearchValue(value);
  }

  function handlePageChange(page: number) {
    applyFilters({
      ...filters,
      page,
    });
  }

  async function handleCreateExpense(payload: ExpensePayload) {
    if (!guardMutation()) return;
    try {
      await createExpenseMutation.mutateAsync(payload);
      setQuickAddValues(initialExpensePayload());
      setDialogOpen(false);
      toast.success('Expense added');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to add expense');
    }
  }

  async function handleDialogSubmit(payload: ExpensePayload) {
    if (!guardMutation()) return;
    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpense.id,
          payload,
        });
        toast.success('Expense updated');
      } else {
        await createExpenseMutation.mutateAsync(payload);
        toast.success('Expense added');
      }

      setDialogOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  }

  async function handleDeleteExpense(expense: ExpenseRecord) {
    if (!guardMutation()) return;
    if (!window.confirm(`Delete ${expense.merchant}?`)) {
      return;
    }

    try {
      await deleteExpenseMutation.mutateAsync(expense.id);
      toast.success('Expense deleted');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  }

  function openCreateDialog() {
    setEditingExpense(null);
    setDialogOpen(true);
  }

  function openEditDialog(expense: ExpenseRecord) {
    setEditingExpense(expense);
    setDialogOpen(true);
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.10),_transparent_22%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 dark:text-rose-400">
                  Expense Tracker
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                  Track every peso before it disappears into the month.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Log transactions quickly, audit card usage, and slice your spending history with the same URL-backed workflow used across the dashboard.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Card className="rounded-3xl border-white/60 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/85">
                  <CardContent className="px-5 py-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Filtered spend</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(stats.totalAmount)}</p>
                  </CardContent>
                </Card>
                <button
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                  onClick={openCreateDialog}
                  type="button"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-[2rem] border-white/60 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/85">
              <CardContent className="p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Transactions</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{stats.totalCount}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Current result set</p>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-white/60 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/85">
              <CardContent className="p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Average ticket</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{formatCurrency(stats.average)}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Based on filtered expenses</p>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-white/60 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/85">
              <CardContent className="p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Linked cards</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{stats.linkedCards}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Accounts with tracked activity</p>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-white/60 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/85">
              <CardContent className="p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Recent feed</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{recentExpenses.length}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Latest transactions loaded</p>
              </CardContent>
            </Card>
          </div>

          <QuickAddExpense
            accounts={accounts}
            isPending={createExpenseMutation.isPending}
            onChange={setQuickAddValues}
            onOpenFullForm={openCreateDialog}
            onSubmit={handleCreateExpense}
            values={quickAddValues}
          />

          <ExpenseFilterBar
            accounts={accounts}
            filters={filters}
            onClear={() => {
              setSearchValue('');
              setSearchDirty(false);
              applyFilters({ page: 1, pageSize: filters.pageSize ?? 20 });
            }}
            onFiltersChange={applyFilters}
            onSearchValueChange={handleSearchValueChange}
            searchValue={searchDirty ? searchValue : searchFromFilters}
          />

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <CardUsageSummary items={summaries?.accountUsage ?? []} />
            <RecentTransactions expenses={recentExpenses} isLoading={recentExpensesQuery.isLoading} />
          </div>

          <TransactionHistory
            expenses={expenses}
            isLoading={expensesQuery.isLoading}
            onDelete={handleDeleteExpense}
            onEdit={openEditDialog}
            onPageChange={handlePageChange}
            page={expenseList?.page ?? filters.page ?? 1}
            totalCount={expenseList?.totalCount ?? 0}
            totalPages={expenseList?.totalPages ?? 1}
          />

          <ExpenseFormDialog
            key={`${editingExpense?.id ?? 'new'}-${dialogOpen ? 'open' : 'closed'}`}
            accounts={accounts}
            budgetItems={budgetItems}
            expense={editingExpense}
            isPending={createExpenseMutation.isPending || updateExpenseMutation.isPending}
            onOpenChange={(open) => {
              setDialogOpen(open);

              if (!open) {
                setEditingExpense(null);
              }
            }}
            onSubmit={handleDialogSubmit}
            open={dialogOpen}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesPageContent />
    </Suspense>
  );
}