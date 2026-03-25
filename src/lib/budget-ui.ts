import type {
  BudgetCategory,
  BudgetFilters,
  BudgetItem,
} from '@/types/budgets';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

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

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === 'number' ? value : Number(value);
}

export function formatCurrency(value: number | string | null | undefined) {
  const amount = toNumber(value);

  return currencyFormatter.format(amount).replace('PHP', '₱');
}

export function groupBudgetItemsByCategory(items: BudgetItem[]) {
  const groups = items.reduce<Record<BudgetCategory, BudgetItem[]>>((accumulator, item) => {
    if (!accumulator[item.category]) {
      accumulator[item.category] = [];
    }

    accumulator[item.category].push(item);
    return accumulator;
  }, {} as Record<BudgetCategory, BudgetItem[]>);

  return Object.entries(groups)
    .sort(([left], [right]) => budgetCategoryLabels[left as BudgetCategory].localeCompare(budgetCategoryLabels[right as BudgetCategory]))
    .map(([category, categoryItems]) => ({
      category: category as BudgetCategory,
      categoryLabel: budgetCategoryLabels[category as BudgetCategory],
      items: categoryItems.sort((left, right) => left.dueDate - right.dueDate),
    }));
}

export function getDurationMetrics(item: BudgetItem) {
  const totalMonths = item.totalMonths ?? 0;
  const completedPayments = Math.min(item.completedPayments, totalMonths);
  const remainingMonths = Math.max(totalMonths - completedPayments, 0);
  const monthlyAmount = toNumber(item.amount);
  const remainingDebt = remainingMonths * monthlyAmount;
  const percentPaid = totalMonths > 0 ? Math.round((completedPayments / totalMonths) * 100) : 0;

  return {
    completedPayments,
    monthlyAmount,
    percentPaid,
    remainingDebt,
    remainingMonths,
    totalMonths,
  };
}

export function calculateEarlyPayoff(item: BudgetItem, extraPayment: number) {
  const { monthlyAmount, remainingDebt, remainingMonths } = getDurationMetrics(item);

  if (monthlyAmount <= 0 || remainingDebt <= 0 || extraPayment <= 0) {
    return {
      monthsEarly: 0,
      projectedMonths: remainingMonths,
    };
  }

  const projectedMonths = Math.ceil(remainingDebt / (monthlyAmount + extraPayment));
  const monthsEarly = Math.max(remainingMonths - projectedMonths, 0);

  return {
    monthsEarly,
    projectedMonths,
  };
}

export function countActiveBudgetFilters(filters: BudgetFilters) {
  let count = 0;

  if (filters.search) {
    count += 1;
  }

  if (filters.type) {
    count += 1;
  }

  if (filters.category && filters.category.length > 0) {
    count += 1;
  }

  if (filters.startDate || filters.endDate) {
    count += 1;
  }

  return count;
}