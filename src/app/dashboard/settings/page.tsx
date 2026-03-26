'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useTheme as useNextTheme } from 'next-themes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BellRing, Download, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useCreateCustomCategoryMutation,
  useCustomCategoriesQuery,
  useDeleteAccountMutation,
  useDeleteCustomCategoryMutation,
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
import { budgetCategoryLabels } from '@/lib/expense-ui';
import {
  getBrowserPushSubscription,
  isPushNotificationSupported,
  subscribeCurrentBrowser,
  unsubscribeCurrentBrowser,
} from '@/lib/notifications/client';
import type { NotificationPreferenceRecord } from '@/types/notifications';

const avatarPresets = [
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-1',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-2',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-3',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-4',
];

const builtInCategories = Object.values(budgetCategoryLabels);

const notificationOptions: Array<{
  description: string;
  key: keyof Omit<NotificationPreferenceRecord, 'userId'>;
  label: string;
}> = [
  {
    description: 'Reminders for bills due in 3 days, tomorrow, and today.',
    key: 'billReminders',
    label: 'Bill reminders',
  },
  {
    description: 'Alerts when category budgets reach 80%, 90%, and 100% usage.',
    key: 'budgetWarnings',
    label: 'Budget warnings',
  },
  {
    description: 'Celebrations for milestones and future gamified achievements.',
    key: 'achievementAlerts',
    label: 'Achievement alerts',
  },
  {
    description: 'Daily nudges reserved for future coaching content.',
    key: 'dailyTips',
    label: 'Daily tips',
  },
  {
    description: 'A weekly recap of your spending, income, and savings activity.',
    key: 'weeklySummary',
    label: 'Weekly summary',
  },
  {
    description: 'Warnings when your activity streak is about to break by 8 PM.',
    key: 'streakWarnings',
    label: 'Streak warnings',
  },
  {
    description: 'Challenge deadline reminders reserved for future game loops.',
    key: 'challengeDeadlines',
    label: 'Challenge deadlines',
  },
];

export default function SettingsPage() {
  const settingsQuery = useSettingsQuery();
  const categoriesQuery = useCustomCategoriesQuery();
  const notificationPreferencesQuery = useNotificationPreferencesQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const updatePreferencesMutation = useUpdatePreferencesMutation();
  const updateNotificationPreferencesMutation = useUpdateNotificationPreferencesMutation();
  const createCustomCategoryMutation = useCreateCustomCategoryMutation();
  const deleteCustomCategoryMutation = useDeleteCustomCategoryMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const subscribeToNotificationsMutation = useSubscribeToNotificationsMutation();
  const unsubscribeFromNotificationsMutation = useUnsubscribeFromNotificationsMutation();
  const sendTestNotificationMutation = useSendTestNotificationMutation();
  const queryClient = useQueryClient();
  const { setTheme, resolvedTheme } = useNextTheme();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [profileDirty, setProfileDirty] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const profileDefaults = useMemo(() => ({
    bio: settingsQuery.data?.bio ?? '',
    image: settingsQuery.data?.image ?? '',
    name: settingsQuery.data?.name ?? '',
  }), [settingsQuery.data?.bio, settingsQuery.data?.image, settingsQuery.data?.name]);

  useEffect(() => {
    let isActive = true;

    if (!isPushNotificationSupported()) {
      return () => {
        isActive = false;
      };
    }

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setNotificationsSupported(true);
      setNotificationPermission(Notification.permission);
    });

    getBrowserPushSubscription()
      .then((subscription) => {
        if (isActive) {
          setIsSubscribed(Boolean(subscription));
        }
      })
      .catch(() => {
        if (isActive) {
          setIsSubscribed(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const exportMutation = useMutation({
    mutationFn: async (format: 'json' | 'csv') => {
      const response = await fetch(`/api/settings/export?format=${format}`, {
        credentials: 'same-origin',
      });

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

  async function handleProfileSave() {
    try {
      await updateProfileMutation.mutateAsync({
        bio: profileDirty ? bio : profileDefaults.bio,
        image: profileDirty ? image : profileDefaults.image,
        name: profileDirty ? name : profileDefaults.name,
      });
      setProfileDirty(false);
      toast.success('Profile updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }

  async function handlePasswordSave() {
    try {
      await updatePasswordMutation.mutateAsync({ confirmPassword, currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  }

  async function handleThemeChange(theme: 'light' | 'dark' | 'system') {
    try {
      setTheme(theme);
      await updatePreferencesMutation.mutateAsync({ preferredTheme: theme.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM' });
      toast.success('Theme preference updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  }

  async function handleCreateCategory() {
    if (!customCategoryName.trim()) {
      return;
    }

    try {
      await createCustomCategoryMutation.mutateAsync({ name: customCategoryName.trim() });
      setCustomCategoryName('');
      toast.success('Custom category added');
    } catch (error) {
      console.error('Error creating custom category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add category');
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteCustomCategoryMutation.mutateAsync(id);
      toast.success('Custom category deleted');
    } catch (error) {
      console.error('Error deleting custom category:', error);
      toast.error('Failed to delete category');
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccountMutation.mutateAsync({ confirmation: deleteConfirmation as 'DELETE' });
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  }

  async function handleEnableNotifications() {
    if (!isPushNotificationSupported()) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== 'granted') {
        toast.error('Notification permission was not granted');
        return;
      }

      const subscription = await subscribeCurrentBrowser();
      await subscribeToNotificationsMutation.mutateAsync(subscription);
      setIsSubscribed(true);
      toast.success('Notifications enabled for this device');
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enable notifications');
    }
  }

  async function handleDisableNotifications() {
    try {
      const endpoint = await unsubscribeCurrentBrowser();

      if (endpoint) {
        await unsubscribeFromNotificationsMutation.mutateAsync(endpoint);
      }

      setIsSubscribed(false);
      toast.success('Notifications disabled for this device');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    }
  }

  async function handleNotificationPreferenceChange(
    key: keyof Omit<NotificationPreferenceRecord, 'userId'>,
    checked: boolean,
  ) {
    try {
      await updateNotificationPreferencesMutation.mutateAsync({
        [key]: checked,
      });
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    }
  }

  async function handleSendTestNotification() {
    try {
      await sendTestNotificationMutation.mutateAsync({
        body: 'MoneyQuest push notifications are configured for this browser.',
        tag: 'moneyquest-test-notification',
        title: 'MoneyQuest test notification',
        url: '/dashboard/settings',
      });
      toast.success('Test notification requested');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send test notification');
    }
  }

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

  const displayName = profileDirty ? name : profileDefaults.name;
  const displayBio = profileDirty ? bio : profileDefaults.bio;
  const displayImage = profileDirty ? image : profileDefaults.image;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.07),_transparent_24%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
            <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Settings</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">Profile, security, exports, and the knobs that matter.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">Keep your account details current, protect access, and manage the small preferences that shape the dashboard experience.</p>
            </section>

            <Tabs defaultValue="profile" className="gap-6">
              <TabsList variant="line" className="w-full justify-start overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/90 p-2 dark:border-slate-800 dark:bg-slate-950/80">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="rounded-[2rem]">
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Edit your name, short bio, and avatar preset.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                      <div className="space-y-4">
                        <Avatar size="lg" className="size-20">
                          {displayImage ? <AvatarImage src={displayImage} alt={displayName || 'Profile avatar'} /> : null}
                          <AvatarFallback>{(displayName || settingsQuery.data?.email || 'MQ').slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {avatarPresets.map((preset) => (
                            <button key={preset} className={`rounded-2xl border p-2 ${displayImage === preset ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-800'}`} onClick={() => { setProfileDirty(true); setImage(preset); }} type="button">
                              <Avatar size="lg" className="size-12">
                                <AvatarImage src={preset} alt="Avatar preset" />
                                <AvatarFallback>MQ</AvatarFallback>
                              </Avatar>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid flex-1 gap-4 md:grid-cols-2">
                        <Input label="Name" value={displayName} onChange={(event) => { setProfileDirty(true); setName(event.target.value); }} />
                        <Input label="Email" value={settingsQuery.data?.email ?? ''} disabled />
                        <div className="md:col-span-2">
                          <Textarea label="Bio" maxLength={200} helperText={`${displayBio.length}/200 characters`} value={displayBio} onChange={(event) => { setProfileDirty(true); setBio(event.target.value); }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button isLoading={updateProfileMutation.isPending} onClick={handleProfileSave}>Save Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="rounded-[2rem]">
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Update your password and handle destructive account actions carefully.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input label="Current Password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                      <Input label="New Password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                      <div className="md:col-span-2">
                        <PasswordStrengthIndicator password={newPassword} />
                      </div>
                      <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                    </div>
                    <div className="flex justify-between gap-3">
                      <Button isLoading={updatePasswordMutation.isPending} onClick={handlePasswordSave}>Change Password</Button>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="size-4" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card className="rounded-[2rem]">
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Currency display, theme behavior, and custom category management.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                        <p className="text-sm font-medium text-slate-950 dark:text-slate-100">Currency display</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">₱ PHP</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">More currencies coming soon</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                        <p className="text-sm font-medium text-slate-950 dark:text-slate-100">Theme</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {['light', 'dark', 'system'].map((theme) => (
                            <Button key={theme} variant={resolvedTheme === theme || (theme === 'system' && resolvedTheme == null) ? 'primary' : 'outline'} size="sm" onClick={() => handleThemeChange(theme as 'light' | 'dark' | 'system')}>
                              {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <Input label="Add Custom Category" value={customCategoryName} onChange={(event) => setCustomCategoryName(event.target.value)} placeholder="e.g. Pets" />
                        </div>
                        <Button isLoading={createCustomCategoryMutation.isPending} onClick={handleCreateCategory}>Add Category</Button>
                      </div>

                      <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Built-in Categories</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {builtInCategories.map((category) => (
                              <span key={category} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">{category}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Custom Categories</p>
                          <div className="mt-3 space-y-2">
                            {customCategories.length === 0 ? (
                              <p className="text-sm text-slate-500 dark:text-slate-400">No custom categories yet.</p>
                            ) : customCategories.map((category) => (
                              <div key={category.id} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                                <span className="text-sm text-slate-900 dark:text-slate-100">{category.name}</span>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)} isLoading={deleteCustomCategoryMutation.isPending}>
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <Card className="rounded-[2rem]">
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Download your MoneyQuest data in JSON or CSV.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Button isLoading={exportMutation.isPending} onClick={() => exportMutation.mutate('json')}>
                        <Download className="size-4" />
                        Export JSON
                      </Button>
                      <Button isLoading={exportMutation.isPending} onClick={() => exportMutation.mutate('csv')} variant="outline">
                        <Download className="size-4" />
                        Export CSV
                      </Button>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                      Last export date: <span className="font-semibold text-slate-950 dark:text-slate-100">{lastExportDate}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="rounded-[2rem]">
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Enable browser push, choose which alerts matter, and send a test notification to this device.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-950 dark:text-slate-100">
                            <BellRing className="size-4 text-indigo-500" />
                            <p className="font-semibold">Browser notification access</p>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {notificationsSupported
                              ? isSubscribed
                                ? 'This browser is connected for MoneyQuest push notifications.'
                                : 'Grant permission and subscribe this device to receive reminders and summaries.'
                              : 'This browser does not support the Push API.'}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Permission: {notificationPermission}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            isLoading={subscribeToNotificationsMutation.isPending}
                            disabled={!notificationsSupported || isSubscribed}
                            onClick={handleEnableNotifications}
                          >
                            Enable Notifications
                          </Button>
                          <Button
                            variant="outline"
                            isLoading={unsubscribeFromNotificationsMutation.isPending}
                            disabled={!isSubscribed}
                            onClick={handleDisableNotifications}
                          >
                            Disconnect Device
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {notificationOptions.map((option) => (
                        <div key={option.key} className="flex items-center justify-between rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40">
                          <div>
                            <p className="font-medium text-slate-950 dark:text-slate-100">{option.label}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                          </div>
                          <Switch
                            checked={notificationPreferencesQuery.data?.[option.key] ?? false}
                            disabled={notificationPreferencesQuery.isLoading || updateNotificationPreferencesMutation.isPending}
                            onCheckedChange={(checked) => handleNotificationPreferenceChange(option.key, checked)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-slate-950 dark:text-slate-100">Test delivery</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Send a sample push notification to the currently connected browser.</p>
                      </div>
                      <Button
                        disabled={!isSubscribed}
                        isLoading={sendTestNotificationMutation.isPending}
                        onClick={handleSendTestNotification}
                        variant="outline"
                      >
                        <Send className="size-4" />
                        Test Notification
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-md rounded-[2rem] bg-white dark:bg-slate-950">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent. Type DELETE to confirm account deletion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input label="Confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder="Type DELETE" />
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="outline" isLoading={deleteAccountMutation.isPending} disabled={deleteConfirmation !== 'DELETE'} onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </DashboardLayout>
  );
}