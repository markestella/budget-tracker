'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_DAILY_QUOTE } from '@/lib/demo-data';

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
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: dailyQuoteKeys.today(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_DAILY_QUOTE) : () => apiClient<DailyQuote>('/api/content/quote'),
    staleTime: isDemo ? Infinity : 1000 * 60 * 60, // 1 hour — quote changes daily
  });
}
