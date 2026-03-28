'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

// ─── Types ─────────────────────────────────────────────

export interface GuildSummary {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  memberCount: number;
  myRole: string;
  activeChallenge: { id: string; title: string; currentValue: number; targetValue: number } | null;
}

export interface GuildDiscoverEntry {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  isMember: boolean;
  createdAt: string;
}

export interface GuildDetail {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  isPublic: boolean;
  maxMembers: number;
  createdAt: string;
  myRole: string;
  members: { id: string; userId: string; name: string; role: string; joinedAt: string }[];
  challenges: { id: string; title: string; targetType: string; targetValue: number; currentValue: number; status: string; xpReward: number }[];
  messages: { id: string; userId: string; userName: string; content: string; createdAt: string }[];
}

export interface GuildMemberRanking {
  rank: number;
  userId: string;
  name: string;
  role: string;
  xp: number;
  level: number;
}

// ─── Keys ──────────────────────────────────────────────

export const guildKeys = {
  all: ['guilds'] as const,
  myGuilds: () => [...guildKeys.all, 'mine'] as const,
  discover: (page: number, search?: string) =>
    [...guildKeys.all, 'discover', page, search] as const,
  detail: (id: string) => [...guildKeys.all, 'detail', id] as const,
  leaderboard: (id: string) => [...guildKeys.all, 'leaderboard', id] as const,
  messages: (id: string) => [...guildKeys.all, 'messages', id] as const,
  challenges: (id: string) => [...guildKeys.all, 'challenges', id] as const,
};

// ─── Queries ───────────────────────────────────────────

export function useMyGuildsQuery() {
  return useQuery({
    queryKey: guildKeys.myGuilds(),
    queryFn: () => apiClient<GuildSummary[]>('/api/social/guilds'),
  });
}

export function useGuildDiscoverQuery(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set('search', search);
  return useQuery({
    queryKey: guildKeys.discover(page, search),
    queryFn: () =>
      apiClient<{ guilds: GuildDiscoverEntry[]; totalGuilds: number; page: number; totalPages: number }>(
        `/api/social/guilds/discover?${params}`,
      ),
  });
}

export function useGuildDetailQuery(id: string) {
  return useQuery({
    queryKey: guildKeys.detail(id),
    queryFn: () => apiClient<GuildDetail>(`/api/social/guilds/${id}`),
    enabled: !!id,
  });
}

export function useGuildLeaderboardQuery(id: string) {
  return useQuery({
    queryKey: guildKeys.leaderboard(id),
    queryFn: () => apiClient<GuildMemberRanking[]>(`/api/social/guilds/${id}/leaderboard`),
    enabled: !!id,
  });
}

// ─── Mutations ─────────────────────────────────────────

export function useCreateGuildMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPublic?: boolean }) =>
      apiClient('/api/social/guilds', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guildKeys.all });
    },
  });
}

export function useJoinGuildMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ guildId, inviteCode }: { guildId: string; inviteCode?: string }) =>
      apiClient(`/api/social/guilds/${guildId}/join`, {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guildKeys.all });
    },
  });
}

export function useLeaveGuildMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (guildId: string) =>
      apiClient(`/api/social/guilds/${guildId}/leave`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guildKeys.all });
    },
  });
}

export function useSendGuildMessageMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiClient(`/api/social/guilds/${guildId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guildKeys.detail(guildId) });
    },
  });
}

export function useCreateGuildChallengeMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      targetType: string;
      targetValue: number;
      startDate: string;
      endDate: string;
      xpReward?: number;
    }) =>
      apiClient(`/api/social/guilds/${guildId}/challenges`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guildKeys.detail(guildId) });
    },
  });
}
