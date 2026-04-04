'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_ACTIVE_QUESTS, DEMO_QUEST_HISTORY } from '@/lib/demo-data';

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
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: questKeys.active(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_ACTIVE_QUESTS) : () => apiClient<UserQuestData[]>('/api/game/quests/active'),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useQuestHistoryQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: questKeys.history(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_QUEST_HISTORY) : () => apiClient<UserQuestData[]>('/api/game/quests/history'),
    staleTime: isDemo ? Infinity : undefined,
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
