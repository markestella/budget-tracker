'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

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
  return useQuery({
    queryKey: gameProfileKeys.detail(),
    queryFn: () => apiClient<GameProfile>('/api/game/profile'),
  });
}
