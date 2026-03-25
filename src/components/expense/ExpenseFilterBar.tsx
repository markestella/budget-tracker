'use client';

import { CalendarRange, Filter, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Input from '@/components/ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { budgetCategoryLabels, countActiveExpenseFilters, getExpensePresetRange, getExpenseRangeLabel } from '@/lib/expense-ui';
import type { Account } from '@/hooks/api/useAccountHooks';
import type { BudgetCategory } from '@/types/budgets';
import type { ExpenseFilters } from '@/types/expenses';

const expenseCategories = Object.keys(budgetCategoryLabels) as BudgetCategory[];

interface ExpenseFilterBarProps {
  accounts: Account[];
  filters: ExpenseFilters;
  onClear: () => void;
  onFiltersChange: (filters: ExpenseFilters) => void;
  onSearchValueChange: (value: string) => void;
  searchValue: string;
}

export function ExpenseFilterBar({
  accounts,
  filters,
  onClear,
  onFiltersChange,
  onSearchValueChange,
  searchValue,
}: ExpenseFilterBarProps) {
  const activeFilterCount = countActiveExpenseFilters(filters);

  function toggleCategory(category: BudgetCategory, checked: boolean) {
    const nextCategories = checked
      ? [...(filters.category ?? []), category]
      : (filters.category ?? []).filter((value) => value !== category);

    onFiltersChange({
      ...filters,
      category: nextCategories.length > 0 ? nextCategories : undefined,
      page: 1,
    });
  }

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <Filter className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expense Filters</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Date range, category, card, amount range, and search.</p>
          </div>
          {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount} active</Badge> : null}
        </div>

        <Button onClick={onClear} size="sm" variant="ghost">
          <X className="size-4" />
          Clear Filters
        </Button>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search expenses"
            className="pl-11"
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder="Search merchant or notes"
            value={searchValue}
          />
        </div>

        <Popover>
          <PopoverTrigger render={<Button className="w-full justify-between lg:w-[220px]" variant="outline" />}>
            <span className="flex items-center gap-2">
              <CalendarRange className="size-4" />
              {getExpenseRangeLabel(filters)}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Date range</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Use a preset or define a custom window.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => onFiltersChange({ ...filters, ...getExpensePresetRange('this-month'), page: 1 })} size="sm" variant="outline">This Month</Button>
              <Button onClick={() => onFiltersChange({ ...filters, ...getExpensePresetRange('last-month'), page: 1 })} size="sm" variant="outline">Last Month</Button>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300/80 p-3 dark:border-slate-700">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Custom Range</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input
                  label="Start"
                  onChange={(event) => onFiltersChange({ ...filters, page: 1, startDate: event.target.value || undefined })}
                  type="date"
                  value={filters.startDate ?? ''}
                />
                <Input
                  label="End"
                  onChange={(event) => onFiltersChange({ ...filters, page: 1, endDate: event.target.value || undefined })}
                  type="date"
                  value={filters.endDate ?? ''}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Min ₱"
                min="0"
                onChange={(event) => onFiltersChange({ ...filters, minAmount: event.target.value ? Number(event.target.value) : undefined, page: 1 })}
                step="0.01"
                type="number"
                value={filters.minAmount ?? ''}
              />
              <Input
                label="Max ₱"
                min="0"
                onChange={(event) => onFiltersChange({ ...filters, maxAmount: event.target.value ? Number(event.target.value) : undefined, page: 1 })}
                step="0.01"
                type="number"
                value={filters.maxAmount ?? ''}
              />
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button className="w-full justify-between lg:w-[220px]" variant="outline" />}>
            <span>{filters.category?.length ? `Categories (${filters.category.length})` : 'Categories'}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Expense categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {expenseCategories.map((category) => (
              <DropdownMenuCheckboxItem key={category} checked={filters.category?.includes(category) ?? false} onCheckedChange={(checked) => toggleCategory(category, checked)}>
                {budgetCategoryLabels[category]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground/90">Card / Account</label>
          <Select value={filters.accountId ?? 'all'} onValueChange={(value) => onFiltersChange({ ...filters, accountId: value === 'all' ? undefined : value, page: 1 })}>
            <SelectTrigger className="h-11 w-full lg:w-[220px]">
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}