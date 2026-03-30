'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { ProfileSkeleton } from './SettingsSkeleton';
import { cn } from '@/lib/utils';
import type { ProfileUpdatePayload, SettingsProfile } from '@/types/settings';

const avatarPresets = [
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-1',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-2',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-3',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-4',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-5',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-6',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-7',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=moneyquest-8',
];

interface ProfileSectionProps {
  settingsData: SettingsProfile | undefined;
  isLoading: boolean;
  updateProfileMutation: UseMutationResult<SettingsProfile, Error, ProfileUpdatePayload>;
}

export default function ProfileSection({ settingsData, isLoading, updateProfileMutation }: ProfileSectionProps) {
  const [name, setName] = useState(settingsData?.name ?? '');
  const [bio, setBio] = useState(settingsData?.bio ?? '');
  const [image, setImage] = useState(settingsData?.image ?? '');
  const [profileDirty, setProfileDirty] = useState(false);

  const profileDefaults = useMemo(() => ({
    bio: settingsData?.bio ?? '',
    image: settingsData?.image ?? '',
    name: settingsData?.name ?? '',
  }), [settingsData?.bio, settingsData?.image, settingsData?.name]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const displayName = profileDirty ? name : profileDefaults.name;
  const displayBio = profileDirty ? bio : profileDefaults.bio;
  const displayImage = profileDirty ? image : profileDefaults.image;

  function markDirty() {
    if (!profileDirty) {
      setName((prev) => prev || profileDefaults.name);
      setBio((prev) => prev || profileDefaults.bio);
      setImage((prev) => prev || profileDefaults.image);
      setProfileDirty(true);
    }
  }

  async function handleProfileSave() {
    try {
      await updateProfileMutation.mutateAsync({
        bio: displayBio,
        image: displayImage,
        name: displayName,
      });
      setProfileDirty(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  }

  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Edit your name, short bio, and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="space-y-4">
            <Avatar size="lg" className="size-20">
              {displayImage ? <AvatarImage src={displayImage} alt={displayName || 'Profile avatar'} /> : null}
              <AvatarFallback>{(displayName || settingsData?.email || 'MQ').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {avatarPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { markDirty(); setImage(preset); }}
                  className={cn(
                    'relative rounded-2xl border p-2 transition-all',
                    displayImage === preset
                      ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400 dark:ring-blue-400/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
                  )}
                >
                  <Avatar size="lg" className="size-12">
                    <AvatarImage src={preset} alt="Avatar preset" />
                    <AvatarFallback>MQ</AvatarFallback>
                  </Avatar>
                  {displayImage === preset && (
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-blue-500 text-white dark:bg-blue-400">
                      <Check className="size-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <Input label="Name" value={displayName} onChange={(e) => { markDirty(); setName(e.target.value); }} />
            <Input label="Email" value={settingsData?.email ?? ''} disabled />
            <div className="md:col-span-2">
              <Textarea
                label="Bio"
                maxLength={200}
                helperText={`${displayBio.length}/200 characters`}
                value={displayBio}
                onChange={(e) => { markDirty(); setBio(e.target.value); }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button isLoading={updateProfileMutation.isPending} onClick={handleProfileSave}>
            Save Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
