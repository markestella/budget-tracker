'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_STREAKS } from '@/lib/demo-data';

export interface StreakData {
  current: number;
  longest: number;
  isAtRisk: boolean;
  freezesRemaining: number;
  nextMilestone: number | null;
  lastActiveDate: string | null;
}

export const streakKeys = {
  all: ['game-streaks'] as const,
  detail: () => [...streakKeys.all, 'detail'] as const,
};

export function useGameStreaksQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: streakKeys.detail(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_STREAKS) : () => apiClient<StreakData>('/api/game/streaks'),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useStreakFreezeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient('/api/game/streaks/freeze', { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: streakKeys.all });
    },
  });
}
