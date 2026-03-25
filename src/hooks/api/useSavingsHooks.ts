'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/hooks/api/apiClient';
import type {
  SavingsGoalPayload,
  SavingsGoalRecord,
  SavingsGoalUpdatePayload,
  SavingsTransactionPayload,
  SavingsTransactionRecord,
} from '@/types/savings';

export const savingsKeys = {
  all: ['savings'] as const,
  history: (id: string) => [...savingsKeys.all, 'history', id] as const,
  lists: () => [...savingsKeys.all, 'list'] as const,
};

const fetchSavingsGoals = () => apiClient<SavingsGoalRecord[]>('/api/savings');
const fetchSavingsHistory = (id: string) => apiClient<SavingsTransactionRecord[]>(`/api/savings/${id}/history`);
const createSavingsGoal = (payload: SavingsGoalPayload) => apiClient<SavingsGoalRecord>('/api/savings', {
  body: payload,
  method: 'POST',
});
const updateSavingsGoal = ({ id, payload }: { id: string; payload: SavingsGoalUpdatePayload }) => apiClient<SavingsGoalRecord>(`/api/savings/${id}`, {
  body: payload,
  method: 'PUT',
});
const deleteSavingsGoal = (id: string) => apiClient<{ success: boolean }>(`/api/savings/${id}`, {
  method: 'DELETE',
});
const createSavingsTransaction = ({ id, payload }: { id: string; payload: SavingsTransactionPayload }) => apiClient<SavingsTransactionRecord>(`/api/savings/${id}/transactions`, {
  body: payload,
  method: 'POST',
});

export function useSavingsGoalsQuery() {
  return useQuery({
    queryFn: fetchSavingsGoals,
    queryKey: savingsKeys.lists(),
  });
}

export function useSavingsHistoryQuery(id: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => fetchSavingsHistory(id),
    queryKey: savingsKeys.history(id),
  });
}

export function useCreateSavingsGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavingsGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: savingsKeys.all });
    },
  });
}

export function useUpdateSavingsGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSavingsGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: savingsKeys.all });
    },
  });
}

export function useDeleteSavingsGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavingsGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: savingsKeys.all });
    },
  });
}

export function useCreateSavingsTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavingsTransaction,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: savingsKeys.all }),
        queryClient.invalidateQueries({ queryKey: savingsKeys.history(variables.id) }),
      ]);
    },
  });
}