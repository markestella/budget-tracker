'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_LEADERBOARD, DEMO_LEADERBOARD_OPT_IN, DEMO_MY_RANK } from '@/lib/demo-data';

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
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: leaderboardKeys.list(type, period, page),
    queryFn: isDemo
      ? () => Promise.resolve(DEMO_LEADERBOARD)
      : () => apiClient<LeaderboardResponse>(
          `/api/social/leaderboard?type=${type}&period=${period}&page=${page}`,
        ),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useLeaderboardOptInQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: leaderboardKeys.optIn(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_LEADERBOARD_OPT_IN) : () => apiClient<LeaderboardOptIn>('/api/social/leaderboard/opt-in'),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useMyRankQuery(type: string, period: string, enabled: boolean) {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: leaderboardKeys.myRank(type, period),
    queryFn: isDemo
      ? () => Promise.resolve(DEMO_MY_RANK)
      : () => apiClient<MyRank>(
          `/api/social/leaderboard/me?type=${type}&period=${period}`,
        ),
    enabled: isDemo || enabled,
    staleTime: isDemo ? Infinity : undefined,
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
