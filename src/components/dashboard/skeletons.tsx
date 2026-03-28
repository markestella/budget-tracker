'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-1 h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* List section */}
      <ListSkeleton rows={5} />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="mb-1 h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
