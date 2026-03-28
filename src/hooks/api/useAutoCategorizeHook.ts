import { useMutation } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export function useAutoCategorize() {
  return useMutation({
    mutationFn: (description: string) =>
      apiClient<{ category: string; confidence: number }>('/api/ai/categorize', { method: 'POST', body: { description } }),
  });
}
