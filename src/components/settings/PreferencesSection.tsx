'use client';

import { useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { toast } from 'sonner';
import { Sun, Moon, Monitor, Trash2 } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PreferencesSkeleton } from './SettingsSkeleton';
import { budgetCategoryLabels } from '@/lib/expense-ui';
import type { CustomCategoryPayload, CustomCategoryRecord, PreferencesUpdatePayload, SettingsProfile } from '@/types/settings';

const builtInCategories = Object.values(budgetCategoryLabels);

const themeOptions = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

interface PreferencesSectionProps {
  settingsData: SettingsProfile | undefined;
  isLoading: boolean;
  customCategories: CustomCategoryRecord[];
  updatePreferencesMutation: UseMutationResult<SettingsProfile, Error, PreferencesUpdatePayload>;
  createCustomCategoryMutation: UseMutationResult<CustomCategoryRecord, Error, CustomCategoryPayload>;
  deleteCustomCategoryMutation: UseMutationResult<{ success: boolean }, Error, string>;
}

export default function PreferencesSection({
  isLoading,
  customCategories,
  updatePreferencesMutation,
  createCustomCategoryMutation,
  deleteCustomCategoryMutation,
}: PreferencesSectionProps) {
  const { setTheme, resolvedTheme } = useNextTheme();
  const [customCategoryName, setCustomCategoryName] = useState('');

  if (isLoading) {
    return <PreferencesSkeleton />;
  }

  async function handleThemeChange(theme: 'light' | 'dark' | 'system') {
    try {
      setTheme(theme);
      await updatePreferencesMutation.mutateAsync({ preferredTheme: theme.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM' });
      toast.success('Theme updated');
    } catch {
      toast.error('Failed to update theme');
    }
  }

  async function handleCreateCategory() {
    if (!customCategoryName.trim()) return;
    try {
      await createCustomCategoryMutation.mutateAsync({ name: customCategoryName.trim() });
      setCustomCategoryName('');
      toast.success('Custom category added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add category');
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteCustomCategoryMutation.mutateAsync(id);
      toast.success('Custom category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Theme, currency display, and custom categories.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme & Currency */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm font-medium text-slate-950 dark:text-slate-100">Theme</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = resolvedTheme === option.value || (option.value === 'system' && resolvedTheme == null);
                  return (
                    <Button
                      key={option.value}
                      variant={isActive ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange(option.value)}
                    >
                      <Icon className="size-3.5" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm font-medium text-slate-950 dark:text-slate-100">Currency display</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">₱ PHP</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">More currencies coming soon</p>
            </div>
          </div>

          {/* Custom categories */}
          <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input label="Add Custom Category" value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)} placeholder="e.g. Pets" />
              </div>
              <Button isLoading={createCustomCategoryMutation.isPending} onClick={handleCreateCategory}>Add Category</Button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
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
    </div>
  );
}
