'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

export interface BadgeData {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
  isShowcased: boolean;
}

export const badgeKeys = {
  all: ['game-badges'] as const,
  list: () => [...badgeKeys.all, 'list'] as const,
  earned: () => [...badgeKeys.all, 'earned'] as const,
};

export function useGameBadgesQuery() {
  return useQuery({
    queryKey: badgeKeys.list(),
    queryFn: () => apiClient<BadgeData[]>('/api/game/badges'),
  });
}

export function useEarnedBadgesQuery() {
  return useQuery({
    queryKey: badgeKeys.earned(),
    queryFn: () => apiClient('/api/game/badges/earned'),
  });
}

export function useShowcaseBadgesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (badgeIds: string[]) =>
      apiClient('/api/game/badges/showcase', {
        method: 'PUT',
        body: { badgeIds },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: badgeKeys.all });
    },
  });
}
