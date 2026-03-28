import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export const aiInsightKeys = {
  patterns: ['ai', 'patterns'] as const,
  budgetSuggestions: ['ai', 'budget-suggestions'] as const,
  cashFlow: ['ai', 'cash-flow'] as const,
};

export function useSpendingPatternsQuery() {
  return useQuery({
    queryKey: aiInsightKeys.patterns,
    queryFn: () => apiClient<{ patterns: Array<{ id: string; type: string; category: string; deviation: number; insight: string; period: string }> }>('/api/ai/insights/patterns'),
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
  return useQuery({
    queryKey: aiInsightKeys.budgetSuggestions,
    queryFn: () => apiClient<{ suggestions: Array<{ id: string; category: string; currentAmount: number; suggestedAmount: number; reasoning: string; estimatedSavings: number; status: string }> }>('/api/ai/insights/budget-suggestions'),
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
  return useQuery({
    queryKey: aiInsightKeys.cashFlow,
    queryFn: () => apiClient<{
      dailyBalances: Array<{ day: number; date: string; projectedBalance: number; isProjected: boolean }>;
      projectedZeroDate: string | null;
      summary: string;
      stats: { totalBudget: number; totalSpent: number; remaining: number; dailySpendRate: number; daysRemaining: number };
    }>('/api/ai/insights/cash-flow'),
    staleTime: 5 * 60 * 1000,
  });
}
