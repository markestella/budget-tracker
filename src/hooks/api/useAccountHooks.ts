'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

type NumericValue = number | string;
type AccountType = 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD' | 'DEBIT_CARD';
type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface Account {
  id: string;
  userId: string;
  accountType: AccountType;
  bankName: string;
  accountName: string;
  accountNumber: string | null;
  currentBalance: NumericValue;
  interestRate: NumericValue | null;
  status: AccountStatus;
  expiryDate: string | null;
  cutoffDate: number | null;
  statementDate: number | null;
  creditLimit: NumericValue | null;
  minimumPaymentDue: NumericValue | null;
  paymentDueDate: string | null;
  createdAt: string;
  updatedAt: string;
  calculations: {
    availableCredit?: number;
    utilizationRate?: number;
  };
}

export interface AccountDashboardSummary {
  totalLiquidAssets: number;
  totalCreditLimit: number;
  totalCreditBalance: number;
  totalAvailableCredit: number;
  totalCreditUtilization: number;
  accountCounts: {
    savings: number;
    checking: number;
    creditCards: number;
    debitCards: number;
  };
  alerts: Array<{
    type: string;
    accountId: string;
    accountName: string;
    message: string;
    severity: 'info' | 'warning' | 'danger';
  }>;
}

export interface AccountMutationInput {
  accountType: AccountType;
  bankName: string;
  accountName: string;
  accountNumber?: string;
  currentBalance: number;
  interestRate?: number;
  status?: AccountStatus;
  expiryDate?: string;
  cutoffDate?: number;
  creditLimit?: number;
  minimumPaymentDue?: number;
  paymentDueDate?: string;
}

export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  dashboard: () => [...accountKeys.all, 'dashboard'] as const,
};

const fetchAccounts = () => apiClient<Account[]>('/api/accounts');

const fetchAccountDashboard = () =>
  apiClient<AccountDashboardSummary>('/api/accounts/dashboard');

const createAccount = (payload: AccountMutationInput) =>
  apiClient<Account>('/api/accounts', {
    method: 'POST',
    body: payload,
  });

export function useAccountsQuery() {
  const accountsQuery = useQuery({
    queryKey: accountKeys.lists(),
    queryFn: fetchAccounts,
  });

  const dashboardQuery = useQuery({
    queryKey: accountKeys.dashboard(),
    queryFn: fetchAccountDashboard,
  });

  return {
    accountsQuery,
    dashboardQuery,
  };
}

export function useAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccount,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: accountKeys.dashboard() }),
      ]);
    },
  });
}