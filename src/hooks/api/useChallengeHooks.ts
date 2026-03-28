'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

// ─── Types ─────────────────────────────────────────────

export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  type: string;
  month: number | null;
  xpReward: number;
  exclusiveBadgeKey: string | null;
  completionCriteria: Record<string, unknown>;
  participantCount: number;
  userProgress: {
    progress: number;
    status: string;
    completedAt: string | null;
  } | null;
}

export interface ChallengeDetail extends ChallengeDefinition {
  recentCompletions: { userName: string; completedAt: string | null }[];
}

export interface ChallengeLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  completedChallenges: number;
}

// ─── Keys ──────────────────────────────────────────────

export const challengeKeys = {
  all: ['challenges'] as const,
  list: () => [...challengeKeys.all, 'list'] as const,
  detail: (id: string) => [...challengeKeys.all, 'detail', id] as const,
  leaderboard: (page: number) => [...challengeKeys.all, 'leaderboard', page] as const,
};

// ─── Queries ───────────────────────────────────────────

export function useChallengesQuery() {
  return useQuery({
    queryKey: challengeKeys.list(),
    queryFn: () => apiClient<ChallengeDefinition[]>('/api/challenges'),
  });
}

export function useChallengeDetailQuery(id: string) {
  return useQuery({
    queryKey: challengeKeys.detail(id),
    queryFn: () => apiClient<ChallengeDetail>(`/api/challenges/${id}`),
    enabled: !!id,
  });
}

export function useChallengeLeaderboardQuery(page: number) {
  return useQuery({
    queryKey: challengeKeys.leaderboard(page),
    queryFn: () =>
      apiClient<{
        entries: ChallengeLeaderboardEntry[];
        totalEntries: number;
        page: number;
        totalPages: number;
      }>(`/api/challenges/leaderboard?page=${page}`),
  });
}

// ─── Mutations ─────────────────────────────────────────

export function useJoinChallengeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) =>
      apiClient(`/api/challenges/${challengeId}/join`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.all });
    },
  });
}

export function useTrackChallengeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, progress }: { challengeId: string; progress: number }) =>
      apiClient(`/api/challenges/${challengeId}/track`, {
        method: 'POST',
        body: JSON.stringify({ progress }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.all });
    },
  });
}
