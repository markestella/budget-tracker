'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_HEALTH_SCORE } from '@/lib/demo-data';

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
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: healthScoreKeys.detail(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_HEALTH_SCORE) : () => apiClient<HealthScoreData>('/api/game/health-score'),
    staleTime: isDemo ? Infinity : undefined,
  });
}
