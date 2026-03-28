'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useFeedInfiniteQuery } from '@/hooks/api/useSocialFeedHooks';
import { AchievementFeedCard } from './AchievementFeedCard';

export function AchievementFeed() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeedInfiniteQuery();

  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const events = data?.pages.flatMap((p) => p.events) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <span className="text-4xl">📰</span>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          No achievements in the feed yet. Complete quests and earn badges to appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <AchievementFeedCard key={event.id} event={event} />
      ))}

      <div ref={observerRef} className="py-4 text-center">
        {isFetchingNextPage && (
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        )}
        {!hasNextPage && events.length > 0 && (
          <p className="text-xs text-slate-400">You&apos;ve reached the end</p>
        )}
      </div>
    </div>
  );
}
