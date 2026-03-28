'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

// ─── Types ─────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarEmoji: string;
  level: number;
  score: number;
  medalEmoji: string | null;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalEntries: number;
  page: number;
  totalPages: number;
}

export interface LeaderboardOptIn {
  id: string;
  isOptedIn: boolean;
  displayName: string | null;
}

export interface MyRank {
  rank: number;
  score: number;
  displayName: string;
  level: number;
  totalParticipants: number;
}

// ─── Keys ──────────────────────────────────────────────

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  list: (type: string, period: string, page: number) =>
    [...leaderboardKeys.all, type, period, page] as const,
  optIn: () => [...leaderboardKeys.all, 'opt-in'] as const,
  myRank: (type: string, period: string) =>
    [...leaderboardKeys.all, 'me', type, period] as const,
};

// ─── Queries ───────────────────────────────────────────

export function useLeaderboardQuery(type: string, period: string, page: number) {
  return useQuery({
    queryKey: leaderboardKeys.list(type, period, page),
    queryFn: () =>
      apiClient<LeaderboardResponse>(
        `/api/social/leaderboard?type=${type}&period=${period}&page=${page}`,
      ),
  });
}

export function useLeaderboardOptInQuery() {
  return useQuery({
    queryKey: leaderboardKeys.optIn(),
    queryFn: () => apiClient<LeaderboardOptIn>('/api/social/leaderboard/opt-in'),
  });
}

export function useMyRankQuery(type: string, period: string, enabled: boolean) {
  return useQuery({
    queryKey: leaderboardKeys.myRank(type, period),
    queryFn: () =>
      apiClient<MyRank>(
        `/api/social/leaderboard/me?type=${type}&period=${period}`,
      ),
    enabled,
  });
}

// ─── Mutations ─────────────────────────────────────────

export function useLeaderboardOptInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { isOptedIn: boolean; displayName?: string | null }) =>
      apiClient<LeaderboardOptIn>('/api/social/leaderboard/opt-in', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.all });
    },
  });
}
