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
import { countActiveBudgetFilters, budgetCategoryLabels } from '@/lib/budget-ui';
import type { BudgetCategory, BudgetFilters } from '@/types/budgets';

const budgetCategories = Object.keys(budgetCategoryLabels) as BudgetCategory[];

function formatDateLabel(value?: string) {
  if (!value) {
    return 'Select date';
  }

  return new Date(value).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPresetRange(preset: 'this-month' | 'last-month') {
  const now = new Date();
  const offset = preset === 'last-month' ? -1 : 0;
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function getRangeLabel(filters: BudgetFilters) {
  const thisMonth = getPresetRange('this-month');
  const lastMonth = getPresetRange('last-month');

  if (!filters.startDate && !filters.endDate) {
    return 'Date Range';
  }

  if (filters.startDate === thisMonth.startDate && filters.endDate === thisMonth.endDate) {
    return 'This Month';
  }

  if (filters.startDate === lastMonth.startDate && filters.endDate === lastMonth.endDate) {
    return 'Last Month';
  }

  return 'Custom Range';
}

interface BudgetFilterBarProps {
  filters: BudgetFilters;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onFiltersChange: (filters: BudgetFilters) => void;
  onClear: () => void;
}

export function BudgetFilterBar({
  filters,
  searchValue,
  onSearchValueChange,
  onFiltersChange,
  onClear,
}: BudgetFilterBarProps) {
  const activeFilterCount = countActiveBudgetFilters(filters);

  function toggleCategory(category: BudgetCategory, checked: boolean) {
    const nextCategories = checked
      ? [...(filters.category ?? []), category]
      : (filters.category ?? []).filter((value) => value !== category);

    onFiltersChange({
      ...filters,
      category: nextCategories.length > 0 ? nextCategories : undefined,
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
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Filters & Search
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Refine your recurring obligations and loan view.
            </p>
          </div>
          {activeFilterCount > 0 ? (
            <Badge className="ml-1" variant="secondary">
              {activeFilterCount} active
            </Badge>
          ) : null}
        </div>

        <Button onClick={onClear} size="sm" variant="ghost">
          <X className="size-4" />
          Clear Filters
        </Button>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search budget items"
            className="pl-11"
            placeholder="Search by description or merchant"
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger render={<Button variant="outline" className="w-full justify-between lg:w-[220px]" />}>
            <span className="flex items-center gap-2">
              <CalendarRange className="size-4" />
              {getRangeLabel(filters)}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[320px] space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Date range</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a preset or define a custom range.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => onFiltersChange({ ...filters, ...getPresetRange('this-month') })}
                size="sm"
              >
                This Month
              </Button>
              <Button
                variant="outline"
                onClick={() => onFiltersChange({ ...filters, ...getPresetRange('last-month') })}
                size="sm"
              >
                Last Month
              </Button>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300/80 p-3 dark:border-slate-700">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Custom Range
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Start</label>
                  <Input
                    type="date"
                    value={filters.startDate ?? ''}
                    onChange={(event) => onFiltersChange({
                      ...filters,
                      startDate: event.target.value || undefined,
                    })}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateLabel(filters.startDate)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">End</label>
                  <Input
                    type="date"
                    value={filters.endDate ?? ''}
                    onChange={(event) => onFiltersChange({
                      ...filters,
                      endDate: event.target.value || undefined,
                    })}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateLabel(filters.endDate)}</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between lg:w-[240px]" />}>
            <span>
              {filters.category?.length
                ? `Categories (${filters.category.length})`
                : 'Categories'}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Budget categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {budgetCategories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filters.category?.includes(category) ?? false}
                onCheckedChange={(checked) => toggleCategory(category, checked)}
              >
                {budgetCategoryLabels[category]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}