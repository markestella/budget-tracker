export type NumericValue = number | string;

export type BudgetItemType = 'CONSTANT' | 'DURATION';

export type BudgetCategory =
  | 'HOUSING'
  | 'TRANSPORTATION'
  | 'FOOD_DINING'
  | 'UTILITIES'
  | 'ENTERTAINMENT'
  | 'HEALTHCARE'
  | 'SAVINGS_ALLOCATION'
  | 'DEBT_PAYMENTS'
  | 'MISCELLANEOUS'
  | 'CUSTOM';

export interface BudgetLinkedAccount {
  id: string;
  accountName: string;
  accountType: string;
  bankName: string;
}

export interface BudgetItem {
  id: string;
  userId: string;
  type: BudgetItemType;
  description: string;
  amount: NumericValue;
  dueDate: number;
  merchant: string | null;
  category: BudgetCategory;
  linkedAccountId: string | null;
  linkedAccount: BudgetLinkedAccount | null;
  isActive: boolean;
  totalMonths: number | null;
  startDate: string | null;
  endDate: string | null;
  completedPayments: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItemPayload {
  type: BudgetItemType;
  description: string;
  amount: number;
  dueDate: number;
  merchant?: string;
  category: BudgetCategory;
  linkedAccountId?: string;
  isActive?: boolean;
  totalMonths?: number;
  startDate?: string;
}

export interface BudgetItemUpdatePayload extends Partial<BudgetItemPayload> {
  completedPayments?: number;
  markPaid?: boolean;
}

export interface BudgetFilters {
  type?: BudgetItemType;
  startDate?: string;
  endDate?: string;
  category?: BudgetCategory[];
  search?: string;
}

export interface CategoryBudgetRow {
  id: string | null;
  category: BudgetCategory;
  categoryLabel: string;
  monthlyLimit: number | null;
  rollover: boolean;
  spentAmount: number;
  utilizationPercent: number;
}

export interface CategoryBudgetPayload {
  category: BudgetCategory;
  monthlyLimit: number;
  rollover?: boolean;
}

export interface BudgetSummary {
  totalMonthlyIncome: number;
  totalFixedExpenses: number;
  totalLoanPayments: number;
  disposableIncome: number;
}