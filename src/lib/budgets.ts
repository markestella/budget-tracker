import { BudgetCategory, BudgetItemType } from '@prisma/client';

export const budgetCategoryValues = Object.values(BudgetCategory);
export const budgetItemTypeValues = Object.values(BudgetItemType);

export const budgetCategoryLabels: Record<BudgetCategory, string> = {
  HOUSING: 'Housing',
  TRANSPORTATION: 'Transportation',
  FOOD_DINING: 'Food & Dining',
  UTILITIES: 'Utilities',
  ENTERTAINMENT: 'Entertainment',
  HEALTHCARE: 'Healthcare',
  SAVINGS_ALLOCATION: 'Savings Allocation',
  DEBT_PAYMENTS: 'Debt Payments',
  MISCELLANEOUS: 'Miscellaneous',
  CUSTOM: 'Custom',
};

export function calculateBudgetEndDate(startDate: Date, totalMonths: number) {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + totalMonths);
  endDate.setDate(0);

  return endDate;
}

export function getMonthDateRange(referenceDate = new Date()) {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

export function normalizeCategoryValue(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/&/g, 'AND')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function parseCategorySearchParams(values: string[]) {
  return values
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function createBudgetRangeOverlap(
  startDate?: Date,
  endDate?: Date,
) {
  if (!startDate && !endDate) {
    return undefined;
  }

  return {
    OR: [
      {
        type: BudgetItemType.CONSTANT,
        isActive: true,
      },
      {
        type: BudgetItemType.DURATION,
        ...(endDate ? { startDate: { lte: endDate } } : {}),
        ...(startDate ? { endDate: { gte: startDate } } : {}),
      },
    ],
  };
}

export function toNumber(value: number | string | { toString(): string } | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === 'number' ? value : Number(value);
}