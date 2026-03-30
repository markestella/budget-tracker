'use client';

import { startTransition, Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { BudgetFilterBar } from '@/components/budget/BudgetFilterBar';
import { BudgetItemDialog } from '@/components/budget/BudgetItemDialog';
import {
  ConstantExpensesSection,
  DurationExpensesSection,
} from '@/components/budget/BudgetExpenseSections';
import { CategoryBudgetManager } from '@/components/budget/CategoryBudgetManager';
import { IncomeAllocationCard } from '@/components/budget/IncomeAllocationCard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAccountsQuery } from '@/hooks/api/useAccountHooks';
import {
  useBudgetItemsQuery,
  useBudgetSummaryQuery,
  useCategoryBudgetsQuery,
  useCategoryBudgetMutation,
  useCreateBudgetItemMutation,
  useDeleteBudgetItemMutation,
  useUpdateBudgetItemMutation,
} from '@/hooks/api/useBudgetHooks';
import { formatCurrency } from '@/lib/budget-ui';
import type {
  BudgetCategory,
  BudgetFilters,
  BudgetItem,
  BudgetItemPayload,
  BudgetItemType,
} from '@/types/budgets';

function readFilters(searchParams: URLSearchParams): BudgetFilters {
  const categories = searchParams.getAll('category');

  return {
    category: categories.length > 0 ? (categories as BudgetCategory[]) : undefined,
    endDate: searchParams.get('endDate') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    startDate: searchParams.get('startDate') ?? undefined,
  };
}

function buildSearchParams(filters: BudgetFilters) {
  const searchParams = new URLSearchParams();

  if (filters.startDate) {
    searchParams.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    searchParams.set('endDate', filters.endDate);
  }

  if (filters.search) {
    searchParams.set('search', filters.search);
  }

  for (const category of filters.category ?? []) {
    searchParams.append('category', category);
  }

  return searchParams;
}

function BudgetsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = readFilters(new URLSearchParams(searchParams.toString()));
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const [dialogType, setDialogType] = useState<BudgetItemType>('CONSTANT');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [savingCategory, setSavingCategory] = useState<BudgetCategory | null>(null);

  const budgetItemsQuery = useBudgetItemsQuery(filters);
  const budgetSummaryQuery = useBudgetSummaryQuery();
  const categoryBudgetsQuery = useCategoryBudgetsQuery();
  const { accountsQuery } = useAccountsQuery();
  const createBudgetItemMutation = useCreateBudgetItemMutation();
  const updateBudgetItemMutation = useUpdateBudgetItemMutation();
  const deleteBudgetItemMutation = useDeleteBudgetItemMutation();
  const categoryBudgetMutation = useCategoryBudgetMutation();

  useEffect(() => {
    setSearchValue(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if ((filters.search ?? '') === searchValue.trim()) {
        return;
      }

      const nextFilters = {
        ...filters,
        search: searchValue.trim() || undefined,
      };
      const nextSearchParams = buildSearchParams(nextFilters);

      startTransition(() => {
        router.replace(nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname, {
          scroll: false,
        });
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters, pathname, router, searchValue]);

  function applyFilters(nextFilters: BudgetFilters) {
    const nextSearchParams = buildSearchParams(nextFilters);

    startTransition(() => {
      router.replace(nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname, {
        scroll: false,
      });
    });
  }

  function openCreateDialog(type: BudgetItemType) {
    setDialogType(type);
    setEditingItem(null);
    setDialogOpen(true);
  }

  function openEditDialog(item: BudgetItem) {
    setDialogType(item.type);
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function handleBudgetItemSubmit(payload: BudgetItemPayload) {
    try {
      if (editingItem) {
        await updateBudgetItemMutation.mutateAsync({
          id: editingItem.id,
          payload,
        });
        toast.success('Budget item updated');
      } else {
        await createBudgetItemMutation.mutateAsync(payload);
        toast.success('Budget item created');
      }

      setDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving budget item:', error);
      toast.error('Failed to save budget item');
    }
  }

  async function handleDelete(item: BudgetItem) {
    if (!window.confirm(`Delete ${item.description}?`)) {
      return;
    }

    try {
      await deleteBudgetItemMutation.mutateAsync(item.id);
      toast.success('Budget item deleted');
    } catch (error) {
      console.error('Error deleting budget item:', error);
      toast.error('Failed to delete budget item');
    }
  }

  async function handleMarkPaid(item: BudgetItem) {
    try {
      await updateBudgetItemMutation.mutateAsync({
        id: item.id,
        payload: { markPaid: true },
      });
      toast.success('Payment progress updated');
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Failed to update payment progress');
    }
  }

  async function handleSaveCategory(category: BudgetCategory, monthlyLimit: number, rollover: boolean) {
    try {
      setSavingCategory(category);
      await categoryBudgetMutation.mutateAsync({
        category,
        monthlyLimit,
        rollover,
      });
      toast.success('Category budget saved');
    } catch (error) {
      console.error('Error saving category budget:', error);
      toast.error('Failed to save category budget');
    } finally {
      setSavingCategory(null);
    }
  }

  const items = budgetItemsQuery.data ?? [];
  const constantItems = items.filter((item) => item.type === 'CONSTANT');
  const durationItems = items.filter((item) => item.type === 'DURATION');
  const isSavingItem = createBudgetItemMutation.isPending || updateBudgetItemMutation.isPending;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_24%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">
                  Budget Manager
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                  Budget your fixed costs before they budget you.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Capture recurring essentials, loan commitments, category limits, and the disposable income left after your monthly obligations are covered.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-100 px-5 py-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <p className="font-medium">Current filtered obligations</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(items.reduce((sum, item) => sum + Number(item.amount), 0))}
                </p>
              </div>
            </div>
          </section>

          <IncomeAllocationCard
            summary={budgetSummaryQuery.data}
            isLoading={budgetSummaryQuery.isLoading}
          />

          <CategoryBudgetManager
            budgets={categoryBudgetsQuery.data ?? []}
            isLoading={categoryBudgetsQuery.isLoading}
            savingCategory={savingCategory}
            onSave={handleSaveCategory}
          />

          <BudgetFilterBar
            filters={filters}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onFiltersChange={applyFilters}
            onClear={() => applyFilters({})}
          />

          <div className="grid gap-6">
            <ConstantExpensesSection
              items={constantItems}
              onAdd={() => openCreateDialog('CONSTANT')}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />

            <DurationExpensesSection
              items={durationItems}
              onAdd={() => openCreateDialog('DURATION')}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onMarkPaid={handleMarkPaid}
              isMarkingPaid={updateBudgetItemMutation.isPending}
            />
          </div>
        </div>
      </div>

      <BudgetItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        item={editingItem}
        accounts={accountsQuery.data ?? []}
        isPending={isSavingItem}
        onSubmit={handleBudgetItemSubmit}
      />
    </DashboardLayout>
  );
}

export default function BudgetsPage() {
  return (
    <Suspense>
      <BudgetsPageContent />
    </Suspense>
  );
}