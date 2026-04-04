import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_SPENDING_PATTERNS, DEMO_BUDGET_SUGGESTIONS, DEMO_CASH_FLOW } from '@/lib/demo-data';

export const aiInsightKeys = {
  patterns: ['ai', 'patterns'] as const,
  budgetSuggestions: ['ai', 'budget-suggestions'] as const,
  cashFlow: ['ai', 'cash-flow'] as const,
};

export function useSpendingPatternsQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: aiInsightKeys.patterns,
    queryFn: isDemo
      ? () => Promise.resolve(DEMO_SPENDING_PATTERNS)
      : () => apiClient<{ patterns: Array<{ id: string; type: string; category: string; deviation: number; insight: string; period: string }> }>('/api/ai/insights/patterns'),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useAnalyzePatternsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient<{ patterns: unknown[]; message?: string }>('/api/ai/insights/patterns', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiInsightKeys.patterns }),
  });
}

export function useBudgetSuggestionsQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: aiInsightKeys.budgetSuggestions,
    queryFn: isDemo
      ? () => Promise.resolve(DEMO_BUDGET_SUGGESTIONS)
      : () => apiClient<{ suggestions: Array<{ id: string; category: string; currentAmount: number; suggestedAmount: number; reasoning: string; estimatedSavings: number; status: string }> }>('/api/ai/insights/budget-suggestions'),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useGenerateSuggestionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient<{ suggestions: unknown[] }>('/api/ai/insights/budget-suggestions', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiInsightKeys.budgetSuggestions }),
  });
}

export function useApplySuggestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) => apiClient('/api/ai/insights/budget-suggestions/apply', { method: 'POST', body: { suggestionId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiInsightKeys.budgetSuggestions }),
  });
}

export function useCashFlowQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: aiInsightKeys.cashFlow,
    queryFn: isDemo
      ? () => Promise.resolve(DEMO_CASH_FLOW)
      : () => apiClient<{
          dailyBalances: Array<{ day: number; date: string; projectedBalance: number; isProjected: boolean }>;
          projectedZeroDate: string | null;
          summary: string;
          stats: { totalBudget: number; totalSpent: number; remaining: number; dailySpendRate: number; daysRemaining: number };
        }>('/api/ai/insights/cash-flow'),
    staleTime: isDemo ? Infinity : 5 * 60 * 1000,
  });
}
