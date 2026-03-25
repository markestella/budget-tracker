'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/hooks/api/apiClient';
import type {
  BudgetFilters,
  BudgetItem,
  BudgetItemPayload,
  BudgetItemUpdatePayload,
  BudgetSummary,
  CategoryBudgetPayload,
  CategoryBudgetRow,
} from '@/types/budgets';

function createBudgetQueryString(filters: BudgetFilters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.type) {
    searchParams.set('type', filters.type);
  }

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

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export const budgetKeys = {
  all: ['budgets'] as const,
  items: (filters: BudgetFilters = {}) => [...budgetKeys.all, 'items', filters] as const,
  summary: () => [...budgetKeys.all, 'summary'] as const,
  categories: () => [...budgetKeys.all, 'categories'] as const,
};

const fetchBudgetItems = (filters: BudgetFilters) =>
  apiClient<BudgetItem[]>(`/api/budgets${createBudgetQueryString(filters)}`);

const fetchBudgetSummary = () => apiClient<BudgetSummary>('/api/budgets/summary');

const fetchCategoryBudgets = () =>
  apiClient<CategoryBudgetRow[]>('/api/budgets/categories');

const createBudgetItem = (payload: BudgetItemPayload) =>
  apiClient<BudgetItem>('/api/budgets', {
    method: 'POST',
    body: payload,
  });

const updateBudgetItem = ({
  id,
  payload,
}: {
  id: string;
  payload: BudgetItemUpdatePayload;
}) =>
  apiClient<BudgetItem>(`/api/budgets/${id}`, {
    method: 'PUT',
    body: payload,
  });

const deleteBudgetItem = (id: string) =>
  apiClient<{ success: boolean }>(`/api/budgets/${id}`, {
    method: 'DELETE',
  });

const updateCategoryBudget = (payload: CategoryBudgetPayload) =>
  apiClient<CategoryBudgetRow>('/api/budgets/categories', {
    method: 'PUT',
    body: payload,
  });

export function useBudgetItemsQuery(filters: BudgetFilters = {}) {
  return useQuery({
    queryKey: budgetKeys.items(filters),
    queryFn: () => fetchBudgetItems(filters),
  });
}

export function useBudgetSummaryQuery() {
  return useQuery({
    queryKey: budgetKeys.summary(),
    queryFn: fetchBudgetSummary,
  });
}

export function useCategoryBudgetsQuery() {
  return useQuery({
    queryKey: budgetKeys.categories(),
    queryFn: fetchCategoryBudgets,
  });
}

export function useCreateBudgetItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.all }),
      ]);
    },
  });
}

export function useUpdateBudgetItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudgetItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.all }),
      ]);
    },
  });
}

export function useDeleteBudgetItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.all }),
      ]);
    },
  });
}

export function useCategoryBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryBudget,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.categories() }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.summary() }),
      ]);
    },
  });
}