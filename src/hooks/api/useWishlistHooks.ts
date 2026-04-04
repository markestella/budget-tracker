'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_WISHLIST } from '@/lib/demo-data';

export interface WishlistItem {
  id: string;
  userId: string;
  name: string;
  price: string; // Decimal serialized as string
  savedAmount: string;
  imageUrl: string | null;
  productUrl: string | null;
  linkedSavingsGoalId: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'SAVING' | 'AFFORDABLE' | 'PURCHASED';
  createdAt: string;
  updatedAt: string;
}

interface AddFundsResponse {
  item: WishlistItem;
  crossedMilestone: number | null;
}

export const wishlistKeys = {
  all: ['wishlist'] as const,
  list: () => [...wishlistKeys.all, 'list'] as const,
};

export function useWishlistQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: isDemo ? () => Promise.resolve(DEMO_WISHLIST) : () => apiClient<WishlistItem[]>('/api/wishlist'),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; price: number; imageUrl?: string; productUrl?: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }) =>
      apiClient<WishlistItem>('/api/wishlist', { method: 'POST', body: data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<WishlistItem, 'name' | 'priority' | 'status'>> & { price?: number; imageUrl?: string; productUrl?: string } }) =>
      apiClient<WishlistItem>(`/api/wishlist/${id}`, { method: 'PUT', body: data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ success: boolean }>(`/api/wishlist/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

export function useAddFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      apiClient<AddFundsResponse>(`/api/wishlist/${id}/add-funds`, { method: 'POST', body: { amount } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}
