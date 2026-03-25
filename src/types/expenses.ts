export type NumericValue = number | string;

export type ExpenseCategory =
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

export interface ExpenseAccountSummary {
  id: string;
  accountName: string;
  accountType: string;
  bankName: string;
}

export interface ExpenseBudgetLink {
  id: string;
  description: string;
  category: ExpenseCategory;
}

export interface ExpenseRecord {
  id: string;
  userId: string;
  amount: NumericValue;
  category: ExpenseCategory;
  merchant: string;
  date: string;
  notes: string | null;
  linkedAccountId: string | null;
  linkedBudgetItemId: string | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  linkedAccount: ExpenseAccountSummary | null;
  linkedBudgetItem: ExpenseBudgetLink | null;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  preset?: 'this-month' | 'last-month' | 'custom';
  category?: ExpenseCategory[];
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ExpenseListResponse {
  data: ExpenseRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  summaries: {
    totalAmount: number;
    accountUsage: Array<{
      accountId: string;
      accountName: string;
      accountType: string;
      bankName: string;
      totalAmount: number;
      transactionCount: number;
    }>;
  };
}

export interface ExpensePayload {
  amount: number;
  category: ExpenseCategory;
  merchant: string;
  date: string;
  notes?: string;
  linkedAccountId?: string;
  linkedBudgetItemId?: string;
  isRecurring?: boolean;
}

export type ExpenseUpdatePayload = Partial<ExpensePayload>;