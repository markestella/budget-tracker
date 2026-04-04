'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ProfileSection,
  SecuritySection,
  PreferencesSection,
  DataExportSection,
  NotificationsSection,
  SettingsNav,
} from '@/components/settings';
import type { SettingsSection } from '@/components/settings';
import { useDemo } from '@/components/providers/DemoProvider';
import {
  useCustomCategoriesQuery,
  useDeleteAccountMutation,
  useDeleteCustomCategoryMutation,
  useCreateCustomCategoryMutation,
  useSettingsQuery,
  useUpdatePasswordMutation,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  settingsKeys,
} from '@/hooks/api/useSettingsHooks';
import {
  useNotificationPreferencesQuery,
  useSendTestNotificationMutation,
  useSubscribeToNotificationsMutation,
  useUnsubscribeFromNotificationsMutation,
  useUpdateNotificationPreferencesMutation,
} from '@/hooks/api/useNotificationHooks';

export default function SettingsPage() {
  const { isDemo } = useDemo();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  useEffect(() => {
    if (isDemo) {
      toast.info('Settings are not available in demo mode. Sign up to customize your experience!');
      router.replace('/register');
    }
  }, [isDemo, router]);

  const settingsQuery = useSettingsQuery();
  const categoriesQuery = useCustomCategoriesQuery();
  const notificationPreferencesQuery = useNotificationPreferencesQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const updatePreferencesMutation = useUpdatePreferencesMutation();
  const createCustomCategoryMutation = useCreateCustomCategoryMutation();
  const deleteCustomCategoryMutation = useDeleteCustomCategoryMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const subscribeToNotificationsMutation = useSubscribeToNotificationsMutation();
  const unsubscribeFromNotificationsMutation = useUnsubscribeFromNotificationsMutation();
  const updateNotificationPreferencesMutation = useUpdateNotificationPreferencesMutation();
  const sendTestNotificationMutation = useSendTestNotificationMutation();
  const queryClient = useQueryClient();

  const customCategories = categoriesQuery.data ?? settingsQuery.data?.customCategories ?? [];
  const lastExportDate = settingsQuery.data?.lastExportedAt
    ? new Date(settingsQuery.data.lastExportedAt).toLocaleString('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Never';

  const exportMutation = useMutation({
    mutationFn: async (format: 'json' | 'csv' | 'pdf') => {
      if (format === 'pdf') {
        const response = await fetch('/api/settings/export?format=json', { credentials: 'same-origin' });
        if (!response.ok) {
          const details = await response.json().catch(() => null);
          throw new Error(details?.error ?? 'Failed to export data');
        }
        const data = await response.json();
        const { buildPdf } = await import('@/lib/export-utils');
        const sections = Object.entries(data)
          .filter(([key]) => key !== 'exportedAt')
          .map(([name, rows]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            rows: Array.isArray(rows) ? rows as Record<string, unknown>[] : [],
          }));
        const blob = await buildPdf(sections);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'moneyquest-export.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        await queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        return;
      }

      const response = await fetch(`/api/settings/export?format=${encodeURIComponent(format)}`, { credentials: 'same-origin' });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.error ?? 'Failed to export data');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'json' ? 'moneyquest-export.json' : 'moneyquest-export.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.07),_transparent_24%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Settings</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">Profile, security, exports, and the knobs that matter.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">Keep your account details current, protect access, and manage preferences that shape your dashboard experience.</p>
          </section>

          {/* Navigation + content */}
          <div className="flex flex-col gap-6 md:flex-row">
            <SettingsNav active={activeSection} onChange={setActiveSection} />

            <div className="flex-1 min-w-0">
              {activeSection === 'profile' && (
                <ProfileSection
                  settingsData={settingsQuery.data}
                  isLoading={settingsQuery.isLoading}
                  updateProfileMutation={updateProfileMutation}
                />
              )}
              {activeSection === 'security' && (
                <SecuritySection
                  isLoading={settingsQuery.isLoading}
                  updatePasswordMutation={updatePasswordMutation}
                  deleteAccountMutation={deleteAccountMutation}
                />
              )}
              {activeSection === 'preferences' && (
                <PreferencesSection
                  settingsData={settingsQuery.data}
                  isLoading={settingsQuery.isLoading || categoriesQuery.isLoading}
                  customCategories={customCategories}
                  updatePreferencesMutation={updatePreferencesMutation}
                  createCustomCategoryMutation={createCustomCategoryMutation}
                  deleteCustomCategoryMutation={deleteCustomCategoryMutation}
                />
              )}
              {activeSection === 'data' && (
                <DataExportSection
                  isLoading={settingsQuery.isLoading}
                  lastExportDate={lastExportDate}
                  exportMutation={exportMutation}
                />
              )}
              {activeSection === 'notifications' && (
                <NotificationsSection
                  isLoading={notificationPreferencesQuery.isLoading}
                  notificationPreferencesQuery={notificationPreferencesQuery}
                  subscribeToNotificationsMutation={subscribeToNotificationsMutation}
                  unsubscribeFromNotificationsMutation={unsubscribeFromNotificationsMutation}
                  updateNotificationPreferencesMutation={updateNotificationPreferencesMutation}
                  sendTestNotificationMutation={sendTestNotificationMutation}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
