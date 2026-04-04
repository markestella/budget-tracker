'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_GAME_PROFILE } from '@/lib/demo-data';

export interface GameProfile {
  id: string;
  userId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalBadges: number;
  financialHealthScore: number;
  moneyPersonality: string | null;
  currentXP: number;
  xpNeeded: number;
  progress: number;
}

export const gameProfileKeys = {
  all: ['game-profile'] as const,
  detail: () => [...gameProfileKeys.all, 'detail'] as const,
};

export function useGameProfileQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: gameProfileKeys.detail(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_GAME_PROFILE) : () => apiClient<GameProfile>('/api/game/profile'),
    staleTime: isDemo ? Infinity : undefined,
  });
}
