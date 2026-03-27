'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';

export interface AvatarItemData {
  id: string;
  name: string;
  type: string;
  unlockCondition: string;
  unlockValue: string | null;
  imageUrl: string;
  unlocked: boolean;
}

export interface AvatarData {
  avatar: {
    id: string;
    userId: string;
    baseId: string;
    hatId: string | null;
    backgroundId: string | null;
    frameId: string | null;
    accessoryId: string | null;
    title: string | null;
  } | null;
  items: AvatarItemData[];
}

export const avatarKeys = {
  all: ['game-avatar'] as const,
  detail: () => [...avatarKeys.all, 'detail'] as const,
  items: () => [...avatarKeys.all, 'items'] as const,
};

export function useGameAvatarQuery() {
  return useQuery({
    queryKey: avatarKeys.detail(),
    queryFn: () => apiClient<AvatarData>('/api/game/avatar'),
  });
}

export function useAvatarItemsQuery() {
  return useQuery({
    queryKey: avatarKeys.items(),
    queryFn: () => apiClient<AvatarItemData[]>('/api/game/avatar/items'),
  });
}

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selections: {
      baseId: string;
      hatId?: string | null;
      backgroundId?: string | null;
      frameId?: string | null;
      accessoryId?: string | null;
      title?: string | null;
    }) =>
      apiClient('/api/game/avatar', { method: 'PUT', body: selections }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: avatarKeys.all });
    },
  });
}
