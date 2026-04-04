'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/hooks/api/apiClient';
import { useDemo } from '@/components/providers/DemoProvider';
import { DEMO_NOTIFICATION_PREFERENCES } from '@/lib/demo-data';
import type {
  NotificationPreferenceRecord,
  NotificationSendPayload,
  PushSubscriptionPayload,
} from '@/types/notifications';

export const notificationKeys = {
  all: ['notifications'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

const fetchPreferences = () => apiClient<NotificationPreferenceRecord>('/api/notifications/preferences');
const updatePreferences = (payload: Partial<NotificationPreferenceRecord>) =>
  apiClient<NotificationPreferenceRecord>('/api/notifications/preferences', {
    body: payload,
    method: 'PUT',
  });
const subscribe = (payload: PushSubscriptionPayload) =>
  apiClient<{ success: boolean }>('/api/notifications/subscribe', {
    body: payload,
    method: 'POST',
  });
const unsubscribe = (endpoint: string) =>
  apiClient<{ success: boolean }>('/api/notifications/unsubscribe', {
    body: { endpoint },
    method: 'DELETE',
  });
const sendTestNotification = (payload: NotificationSendPayload) =>
  apiClient<{ success: boolean }>('/api/notifications/send', {
    body: { ...payload, test: true },
    method: 'POST',
  });

export function useNotificationPreferencesQuery() {
  const { isDemo } = useDemo();
  return useQuery({
    queryFn: isDemo ? () => Promise.resolve(DEMO_NOTIFICATION_PREFERENCES) : fetchPreferences,
    queryKey: notificationKeys.preferences(),
    staleTime: isDemo ? Infinity : undefined,
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useSubscribeToNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscribe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useUnsubscribeFromNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsubscribe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useSendTestNotificationMutation() {
  return useMutation({
    mutationFn: sendTestNotification,
  });
}
