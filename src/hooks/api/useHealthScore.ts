'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

export interface HealthScoreData {
  score: number;
  tier: string;
  tierTitle: string;
  tierEmoji: string;
  components: {
    budget: number;
    savings: number;
    emergency: number;
    debt: number;
    consistency: number;
  };
  trend: 'up' | 'down' | 'stable' | null;
  history: Array<{
    id: string;
    score: number;
    tier: string;
    calculatedAt: string;
  }>;
}

export const healthScoreKeys = {
  all: ['health-score'] as const,
  detail: () => [...healthScoreKeys.all, 'detail'] as const,
};

export function useHealthScoreQuery() {
  return useQuery({
    queryKey: healthScoreKeys.detail(),
    queryFn: () => apiClient<HealthScoreData>('/api/game/health-score'),
  });
}
