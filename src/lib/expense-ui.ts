import type { BudgetCategory } from '@/types/budgets';
import type { ExpenseFilters } from '@/types/expenses';
import { budgetCategoryLabels, formatCurrency, toNumber } from '@/lib/budget-ui';

export { budgetCategoryLabels, formatCurrency, toNumber };

export function formatRelativeDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }

  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }

  return rtf.format(diffDays, 'day');
}

export function countActiveExpenseFilters(filters: ExpenseFilters) {
  let count = 0;

  if (filters.search) {
    count += 1;
  }

  if (filters.category && filters.category.length > 0) {
    count += 1;
  }

  if (filters.accountId) {
    count += 1;
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    count += 1;
  }

  if (filters.startDate || filters.endDate) {
    count += 1;
  }

  return count;
}

export function getExpensePresetRange(preset: 'this-month' | 'last-month') {
  const now = new Date();
  const offset = preset === 'last-month' ? -1 : 0;
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);

  return {
    endDate: end.toISOString().split('T')[0],
    preset,
    startDate: start.toISOString().split('T')[0],
  } as const;
}

export function getExpenseRangeLabel(filters: ExpenseFilters) {
  const thisMonth = getExpensePresetRange('this-month');
  const lastMonth = getExpensePresetRange('last-month');

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

export function buildExpenseSearchParams(filters: ExpenseFilters) {
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

  if (filters.accountId) {
    searchParams.set('accountId', filters.accountId);
  }

  if (filters.minAmount !== undefined) {
    searchParams.set('minAmount', String(filters.minAmount));
  }

  if (filters.maxAmount !== undefined) {
    searchParams.set('maxAmount', String(filters.maxAmount));
  }

  if (filters.page) {
    searchParams.set('page', String(filters.page));
  }

  if (filters.pageSize) {
    searchParams.set('pageSize', String(filters.pageSize));
  }

  for (const category of filters.category ?? []) {
    searchParams.append('category', category);
  }

  return searchParams;
}

export function readExpenseFilters(searchParams: URLSearchParams): ExpenseFilters {
  const categories = searchParams.getAll('category');
  const minAmount = searchParams.get('minAmount');
  const maxAmount = searchParams.get('maxAmount');
  const page = searchParams.get('page');

  return {
    accountId: searchParams.get('accountId') ?? undefined,
    category: categories.length > 0 ? (categories as BudgetCategory[]) : undefined,
    endDate: searchParams.get('endDate') ?? undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    page: page ? Number(page) : 1,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 20,
    search: searchParams.get('search') ?? undefined,
    startDate: searchParams.get('startDate') ?? undefined,
  };
}

export function getSavingsTypeBadgeClass(type: string) {
  switch (type) {
    case 'EMERGENCY_FUND':
      return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
    case 'RETIREMENT':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
    case 'VACATION':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
    case 'EDUCATION':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300';
    case 'INVESTMENT':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300';
  }
}

export function getSavingsTypeLabel(type: string) {
  return type
    .split('_')
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(' ');
}