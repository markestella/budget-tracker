'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

export interface UserQuestData {
  id: string;
  userId: string;
  questDefinitionId: string;
  assignedAt: string;
  expiresAt: string;
  progress: number;
  status: string;
  completedAt: string | null;
  questDefinition: {
    id: string;
    title: string;
    description: string;
    type: string;
    xpReward: number;
    category: string;
  };
}

export const questKeys = {
  all: ['game-quests'] as const,
  active: () => [...questKeys.all, 'active'] as const,
  history: () => [...questKeys.all, 'history'] as const,
};

export function useActiveQuestsQuery() {
  return useQuery({
    queryKey: questKeys.active(),
    queryFn: () => apiClient<UserQuestData[]>('/api/game/quests/active'),
  });
}

export function useQuestHistoryQuery() {
  return useQuery({
    queryKey: questKeys.history(),
    queryFn: () => apiClient<UserQuestData[]>('/api/game/quests/history'),
  });
}

export function useCheckQuestsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient('/api/game/quests/check', { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questKeys.all });
    },
  });
}
