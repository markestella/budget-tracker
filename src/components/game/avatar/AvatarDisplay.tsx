'use client';

import { cn } from '@/lib/utils';
import { AvatarData } from '@/hooks/api/useGameAvatar';

export function AvatarDisplay({
  avatar,
  size = 'md',
  className,
}: {
  avatar: AvatarData | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeMap = {
    sm: 'h-12 w-12 text-xl',
    md: 'h-20 w-20 text-3xl',
    lg: 'h-28 w-28 text-5xl',
  };

  const items = avatar?.items ?? [];
  const avatarData = avatar?.avatar;

  const baseItem = items.find((i) => i.id === avatarData?.baseId);
  const hatItem = items.find((i) => i.id === avatarData?.hatId);
  const bgItem = items.find((i) => i.id === avatarData?.backgroundId);
  const frameItem = items.find((i) => i.id === avatarData?.frameId);
  const accessoryItem = items.find((i) => i.id === avatarData?.accessoryId);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full',
        sizeMap[size],
        bgItem ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700' : 'bg-slate-100 dark:bg-slate-800',
        frameItem && 'ring-2 ring-amber-400',
        className
      )}
    >
      {/* Background layer */}
      {bgItem && (
        <span className="absolute inset-0 flex items-center justify-center opacity-30 text-[inherit]">
          {bgItem.imageUrl}
        </span>
      )}

      {/* Base avatar */}
      <span className="relative z-10">{baseItem?.imageUrl ?? '😊'}</span>

      {/* Hat layer */}
      {hatItem && (
        <span className="absolute -top-1 left-1/2 z-20 -translate-x-1/2 text-[0.7em]">
          {hatItem.imageUrl}
        </span>
      )}

      {/* Accessory layer */}
      {accessoryItem && (
        <span className="absolute -bottom-0.5 -right-0.5 z-20 text-[0.5em]">
          {accessoryItem.imageUrl}
        </span>
      )}

      {/* Title below */}
      {avatarData?.title && size !== 'sm' && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-slate-500 dark:text-slate-400">
          {avatarData.title}
        </span>
      )}
    </div>
  );
}
