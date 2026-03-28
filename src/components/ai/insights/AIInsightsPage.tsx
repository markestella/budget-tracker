'use client';

import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { SpendingPatternCard } from './SpendingPatternCard';
import { BudgetSuggestionCard } from './BudgetSuggestionCard';
import {
  useSpendingPatternsQuery,
  useAnalyzePatternsMutation,
  useBudgetSuggestionsQuery,
  useGenerateSuggestionsMutation,
  useApplySuggestionMutation,
} from '@/hooks/api/useAIInsightsHooks';

export function AIInsightsPage() {
  const { data: patternsData, isLoading: patternsLoading } = useSpendingPatternsQuery();
  const { data: suggestionsData, isLoading: suggestionsLoading } = useBudgetSuggestionsQuery();
  const analyzeMut = useAnalyzePatternsMutation();
  const generateMut = useGenerateSuggestionsMutation();
  const applyMut = useApplySuggestionMutation();

  function handleAnalyze() {
    analyzeMut.mutate(undefined, {
      onSuccess: () => toast.success('Spending patterns analyzed'),
      onError: () => toast.error('Failed to analyze patterns'),
    });
  }

  function handleGenerate() {
    generateMut.mutate(undefined, {
      onSuccess: () => toast.success('Budget suggestions generated'),
      onError: () => toast.error('Failed to generate suggestions'),
    });
  }

  function handleApply(id: string) {
    applyMut.mutate(id, {
      onSuccess: () => toast.success('Suggestion applied to your budget'),
      onError: () => toast.error('Failed to apply suggestion'),
    });
  }

  const patterns = patternsData?.patterns ?? [];
  const suggestions = suggestionsData?.suggestions ?? [];

  return (
    <div className="space-y-8">
      {/* Spending Patterns Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Spending Patterns</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-detected trends in your spending behavior</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyze}
            isLoading={analyzeMut.isPending}
          >
            🔍 Analyze
          </Button>
        </div>

        {patternsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : patterns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No patterns detected yet. Click &quot;Analyze&quot; to scan your spending history.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {patterns.map((pattern) => (
              <SpendingPatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        )}
      </section>

      {/* Budget Suggestions Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Budget Suggestions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-recommended budget optimizations</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            isLoading={generateMut.isPending}
          >
            ✨ Generate
          </Button>
        </div>

        {suggestionsLoading ? (
          <div className="grid gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No suggestions yet. Click &quot;Generate&quot; to get AI-powered budget recommendations.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {suggestions.map((suggestion) => (
              <BudgetSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={handleApply}
                isApplying={applyMut.isPending}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
