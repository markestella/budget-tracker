'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_BADGES, DEMO_EARNED_BADGES } from '@/lib/demo-data';

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
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: badgeKeys.list(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_BADGES) : () => apiClient<BadgeData[]>('/api/game/badges'),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useEarnedBadgesQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: badgeKeys.earned(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_EARNED_BADGES) : () => apiClient('/api/game/badges/earned'),
    staleTime: isDemo ? Infinity : undefined,
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
