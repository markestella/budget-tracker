'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

// ─── Types ─────────────────────────────────────────────

export interface FeedEvent {
  id: string;
  userId: string;
  userName: string;
  eventType: string;
  displayText: string;
  createdAt: string;
  reactions: Record<string, number>;
  totalReactions: number;
  userReaction: string | null;
}

export interface FeedResponse {
  events: FeedEvent[];
  totalEvents: number;
  page: number;
  totalPages: number;
}

// ─── Keys ──────────────────────────────────────────────

export const feedKeys = {
  all: ['social-feed'] as const,
  list: () => [...feedKeys.all, 'list'] as const,
};

// ─── Queries ───────────────────────────────────────────

export function useFeedInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: feedKeys.list(),
    queryFn: ({ pageParam = 1 }) =>
      apiClient<FeedResponse>(`/api/social/feed?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

// ─── Mutations ─────────────────────────────────────────

export function useFeedReactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, emoji }: { eventId: string; emoji: string }) =>
      apiClient<{ action: string; emoji: string }>(
        `/api/social/feed/${eventId}/react`,
        { method: 'POST', body: JSON.stringify({ emoji }) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}
