'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/hooks/api/apiClient';
import type {
  CustomCategoryPayload,
  CustomCategoryRecord,
  DeleteAccountPayload,
  PasswordUpdatePayload,
  PreferencesUpdatePayload,
  ProfileUpdatePayload,
  SettingsProfile,
} from '@/types/settings';

export const settingsKeys = {
  all: ['settings'] as const,
  categories: () => [...settingsKeys.all, 'categories'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
};

const fetchSettings = () => apiClient<SettingsProfile>('/api/settings');
const fetchCategories = () => apiClient<CustomCategoryRecord[]>('/api/settings/categories');
const updateProfile = (payload: ProfileUpdatePayload) => apiClient<SettingsProfile>('/api/settings', {
  body: payload,
  method: 'PUT',
});
const updatePassword = (payload: PasswordUpdatePayload) => apiClient<{ success: boolean }>('/api/settings', {
  body: { ...payload, mode: 'password' },
  method: 'PUT',
});
const updatePreferences = (payload: PreferencesUpdatePayload) => apiClient<SettingsProfile>('/api/settings', {
  body: { ...payload, mode: 'preferences' },
  method: 'PUT',
});
const createCategory = (payload: CustomCategoryPayload) => apiClient<CustomCategoryRecord>('/api/settings/categories', {
  body: payload,
  method: 'POST',
});
const deleteCategory = (id: string) => apiClient<{ success: boolean }>(`/api/settings/categories/${id}`, {
  method: 'DELETE',
});
const deleteAccount = (payload: DeleteAccountPayload) => apiClient<{ success: boolean }>('/api/settings/account', {
  body: payload,
  method: 'DELETE',
});

export function useSettingsQuery() {
  return useQuery({
    queryFn: fetchSettings,
    queryKey: settingsKeys.profile(),
  });
}

export function useCustomCategoriesQuery() {
  return useQuery({
    queryFn: fetchCategories,
    queryKey: settingsKeys.categories(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.profile() });
      const previous = queryClient.getQueryData<SettingsProfile>(settingsKeys.profile());

      if (previous) {
        queryClient.setQueryData<SettingsProfile>(settingsKeys.profile(), {
          ...previous,
          bio: payload.bio ?? previous.bio,
          image: payload.image ?? previous.image,
          name: payload.name,
        });
      }

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.profile(), context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: updatePassword,
  });
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useCreateCustomCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useDeleteCustomCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}