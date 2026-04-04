'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_EXPENSES, DEMO_RECENT_EXPENSES } from '@/lib/demo-data';
import { buildExpenseSearchParams } from '@/lib/expense-ui';
import type {
  ExpenseFilters,
  ExpenseListResponse,
  ExpensePayload,
  ExpenseRecord,
  ExpenseUpdatePayload,
} from '@/types/expenses';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: (filters: ExpenseFilters = {}) => [...expenseKeys.all, 'list', filters] as const,
  recent: () => [...expenseKeys.all, 'recent'] as const,
};

const fetchExpenses = (filters: ExpenseFilters) => {
  const searchParams = buildExpenseSearchParams(filters);
  const queryString = searchParams.toString();

  return apiClient<ExpenseListResponse>(`/api/expenses${queryString ? `?${queryString}` : ''}`);
};

const fetchRecentExpenses = () => apiClient<ExpenseRecord[]>('/api/expenses/recent');

const createExpense = (payload: ExpensePayload) => apiClient<ExpenseRecord>('/api/expenses', {
  body: payload,
  method: 'POST',
});

const updateExpense = ({ id, payload }: { id: string; payload: ExpenseUpdatePayload }) => apiClient<ExpenseRecord>(`/api/expenses/${id}`, {
  body: payload,
  method: 'PUT',
});

const deleteExpense = (id: string) => apiClient<{ success: boolean }>(`/api/expenses/${id}`, {
  method: 'DELETE',
});

export function useExpensesQuery(filters: ExpenseFilters) {
  const { isDemo } = useDemo();
  return useQuery({
    queryFn: isDemo ? () => Promise.resolve(DEMO_EXPENSES) : () => fetchExpenses(filters),
    queryKey: expenseKeys.lists(filters),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useRecentExpensesQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryFn: isDemo ? () => Promise.resolve(DEMO_RECENT_EXPENSES) : fetchRecentExpenses,
    queryKey: expenseKeys.recent(),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useCreateExpenseMutation(filters: ExpenseFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onMutate: async (payload) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: expenseKeys.lists(filters) }),
        queryClient.cancelQueries({ queryKey: expenseKeys.recent() }),
      ]);

      const previousList = queryClient.getQueryData<ExpenseListResponse>(expenseKeys.lists(filters));
      const previousRecent = queryClient.getQueryData<ExpenseRecord[]>(expenseKeys.recent());
      const categories = filters.category ?? [];
      const matchesCategory = categories.length === 0 || categories.includes(payload.category);
      const matchesAccount = !filters.accountId || filters.accountId === payload.linkedAccountId;
      const matchesSearch = !filters.search || payload.merchant.toLowerCase().includes(filters.search.toLowerCase()) || (payload.notes ?? '').toLowerCase().includes(filters.search.toLowerCase());
      const amount = payload.amount;
      const matchesAmount = (filters.minAmount === undefined || amount >= filters.minAmount) && (filters.maxAmount === undefined || amount <= filters.maxAmount);
      const transactionDate = new Date(payload.date);
      const matchesDate = (!filters.startDate || transactionDate >= new Date(filters.startDate)) && (!filters.endDate || transactionDate <= new Date(filters.endDate));
      const optimisticExpense: ExpenseRecord = {
        amount: payload.amount,
        category: payload.category,
        createdAt: new Date().toISOString(),
        date: payload.date,
        id: `optimistic-${Date.now()}`,
        isRecurring: payload.isRecurring ?? false,
        linkedAccount: null,
        linkedAccountId: payload.linkedAccountId ?? null,
        linkedBudgetItem: null,
        linkedBudgetItemId: payload.linkedBudgetItemId ?? null,
        merchant: payload.merchant,
        notes: payload.notes ?? null,
        updatedAt: new Date().toISOString(),
        userId: 'optimistic',
      };

      if (previousList && matchesCategory && matchesAccount && matchesSearch && matchesAmount && matchesDate) {
        queryClient.setQueryData<ExpenseListResponse>(expenseKeys.lists(filters), {
          ...previousList,
          data: [optimisticExpense, ...previousList.data].slice(0, previousList.pageSize),
          summaries: {
            ...previousList.summaries,
            totalAmount: previousList.summaries.totalAmount + payload.amount,
          },
          totalCount: previousList.totalCount + 1,
          totalPages: Math.max(Math.ceil((previousList.totalCount + 1) / previousList.pageSize), 1),
        });
      }

      queryClient.setQueryData<ExpenseRecord[]>(expenseKeys.recent(), (current) => [optimisticExpense, ...(current ?? [])].slice(0, 10));

      return { previousList, previousRecent };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(expenseKeys.lists(filters), context.previousList);
      }
      if (context?.previousRecent) {
        queryClient.setQueryData(expenseKeys.recent(), context.previousRecent);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
      ]);
    },
  });
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}