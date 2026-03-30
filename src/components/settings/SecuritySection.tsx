'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SecuritySkeleton } from './SettingsSkeleton';
import type { PasswordUpdatePayload, DeleteAccountPayload } from '@/types/settings';

interface SecuritySectionProps {
  isLoading: boolean;
  updatePasswordMutation: UseMutationResult<{ success: boolean }, Error, PasswordUpdatePayload>;
  deleteAccountMutation: UseMutationResult<{ success: boolean }, Error, DeleteAccountPayload>;
}

export default function SecuritySection({
  isLoading,
  updatePasswordMutation,
  deleteAccountMutation,
}: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  if (isLoading) {
    return <SecuritySkeleton />;
  }

  async function handlePasswordSave() {
    try {
      await updatePasswordMutation.mutateAsync({ confirmPassword, currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccountMutation.mutateAsync({ confirmation: deleteConfirmation as 'DELETE' });
      await signOut({ callbackUrl: '/' });
    } catch {
      toast.error('Failed to delete account');
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <div className="md:col-span-2">
              <PasswordStrengthIndicator password={newPassword} />
            </div>
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button isLoading={updatePasswordMutation.isPending} onClick={handlePasswordSave}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="rounded-[2rem] border-red-200/70 dark:border-red-900/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-500" />
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          </div>
          <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(true)} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30">
            <Trash2 className="size-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-[2rem] bg-white dark:bg-slate-950">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent. Type DELETE to confirm account deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input label="Confirmation" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="Type DELETE" />
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="outline" isLoading={deleteAccountMutation.isPending} disabled={deleteConfirmation !== 'DELETE'} onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
