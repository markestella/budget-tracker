'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function ProfileSkeleton() {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="space-y-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="size-16 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-11 rounded-lg" />
            <Skeleton className="h-11 rounded-lg" />
            <Skeleton className="h-28 rounded-lg md:col-span-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SecuritySkeleton() {
  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-11 rounded-lg" />
            <Skeleton className="h-11 rounded-lg" />
            <Skeleton className="h-11 rounded-lg md:col-span-2" />
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[2rem] border-red-200/50 dark:border-red-900/30">
        <CardHeader>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
      </Card>
    </div>
  );
}

export function PreferencesSkeleton() {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 rounded-[1.5rem]" />
          <Skeleton className="h-24 rounded-[1.5rem]" />
        </div>
        <Skeleton className="h-48 rounded-[1.5rem]" />
      </CardContent>
    </Card>
  );
}

export function DataExportSkeleton() {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
        <Skeleton className="h-14 rounded-[1.5rem]" />
      </CardContent>
    </Card>
  );
}

export function NotificationsSkeleton() {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-28 rounded-[1.5rem]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-[1.5rem]" />
        ))}
      </CardContent>
    </Card>
  );
}
