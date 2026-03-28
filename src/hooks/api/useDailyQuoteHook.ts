'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

export interface DailyQuote {
  id: number;
  text: string;
  author: string | null;
  category: string;
}

export const dailyQuoteKeys = {
  all: ['daily-quote'] as const,
  today: () => [...dailyQuoteKeys.all, 'today'] as const,
};

export function useDailyQuoteQuery() {
  return useQuery({
    queryKey: dailyQuoteKeys.today(),
    queryFn: () => apiClient<DailyQuote>('/api/content/quote'),
    staleTime: 1000 * 60 * 60, // 1 hour — quote changes daily
  });
}
