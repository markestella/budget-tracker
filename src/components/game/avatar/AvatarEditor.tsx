'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useGameAvatarQuery,
  useUpdateAvatarMutation,
  AvatarItemData,
} from '@/hooks/api/useGameAvatar';
import { AvatarDisplay } from './AvatarDisplay';
import Button from '@/components/ui/Button';

const itemTypes = [
  { key: 'BASE', label: 'Base', emoji: '😊' },
  { key: 'HAT', label: 'Hats', emoji: '🎩' },
  { key: 'BACKGROUND', label: 'Backgrounds', emoji: '🖼️' },
  { key: 'FRAME', label: 'Frames', emoji: '🖌️' },
  { key: 'ACCESSORY', label: 'Accessories', emoji: '✨' },
];

const unlockConditionLabels: Record<string, (val: string | null) => string> = {
  DEFAULT: () => 'Available by default',
  FREE: () => 'Free to use',
  LEVEL: (val) => `Reach Level ${val?.replace('level:', '') ?? '?'}`,
  BADGE: (val) => `Earn the "${val?.replace('badge:', '') ?? '?'}" badge`,
  STREAK: (val) => `Maintain a ${val}-day streak`,
  EXPENSE_COUNT: (val) => `Log ${val} expenses`,
  SAVINGS_GOAL: (val) => `Complete ${val} savings goals`,
  PREMIUM: () => 'Premium item',
};

function getUnlockLabel(item: AvatarItemData): string {
  const fn = unlockConditionLabels[item.unlockCondition];
  return fn ? fn(item.unlockValue) : `Unlock: ${item.unlockCondition}`;
}

function ItemGrid({
  items,
  selectedId,
  onSelect,
}: {
  items: AvatarItemData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-4 gap-3 sm:grid-cols-5"
    >
      {items.map((item) => (
        <div key={item.id} className="relative group">
          <motion.button
            whileHover={item.unlocked ? { scale: 1.1 } : undefined}
            whileTap={item.unlocked ? { scale: 0.92 } : undefined}
            onClick={() => item.unlocked && onSelect(item.id === selectedId ? null : item.id)}
            className={cn(
              'flex aspect-square w-full items-center justify-center rounded-xl border-2 transition-all duration-150',
              item.unlocked
                ? item.id === selectedId
                  ? 'border-amber-400 bg-amber-50 shadow-[0_0_12px_rgba(251,191,36,0.35)] dark:bg-amber-950/30 dark:shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                  : 'border-transparent bg-white/60 hover:border-slate-300 hover:bg-white dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                : 'cursor-not-allowed border-transparent bg-slate-100/50 opacity-35 dark:bg-slate-800/40'
            )}
          >
            <span className="text-3xl leading-none">{item.imageUrl}</span>
          </motion.button>
          <span className={cn(
            'mt-1 block text-center text-[10px] font-medium leading-tight truncate',
            item.unlocked
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-400 dark:text-slate-600'
          )}>
            {item.unlocked ? item.name : '🔒 Locked'}
          </span>
          {!item.unlocked && (
            <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-700 px-2.5 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
              {getUnlockLabel(item)}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-700" />
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}

export function AvatarEditor({ className }: { className?: string }) {
  const { data: avatarData, isLoading } = useGameAvatarQuery();
  const updateMutation = useUpdateAvatarMutation();

  const avatar = avatarData?.avatar;
  const items = avatarData?.items ?? [];

  const [activeTab, setActiveTab] = useState('BASE');
  const [selections, setSelections] = useState<{
    baseId: string;
    hatId: string | null;
    backgroundId: string | null;
    frameId: string | null;
    accessoryId: string | null;
  } | null>(null);

  const currentSelections = selections ?? {
    baseId: avatar?.baseId ?? '',
    hatId: avatar?.hatId ?? null,
    backgroundId: avatar?.backgroundId ?? null,
    frameId: avatar?.frameId ?? null,
    accessoryId: avatar?.accessoryId ?? null,
  };

  const hasChanges =
    selections !== null &&
    (selections.baseId !== (avatar?.baseId ?? '') ||
      selections.hatId !== (avatar?.hatId ?? null) ||
      selections.backgroundId !== (avatar?.backgroundId ?? null) ||
      selections.frameId !== (avatar?.frameId ?? null) ||
      selections.accessoryId !== (avatar?.accessoryId ?? null));

  function handleSelect(type: string, id: string | null) {
    const key = `${type.toLowerCase()}Id` as keyof typeof currentSelections;
    setSelections({ ...currentSelections, [key]: id });
  }

  function handleSave() {
    if (!currentSelections.baseId) return;
    updateMutation.mutate(currentSelections, {
      onSuccess: () => setSelections(null),
    });
  }

  if (isLoading) {
    return (
      <div className={cn('rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-28 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    );
  }

  const previewData = {
    avatar: {
      id: avatar?.id ?? '',
      userId: avatar?.userId ?? '',
      baseId: currentSelections.baseId,
      hatId: currentSelections.hatId,
      backgroundId: currentSelections.backgroundId,
      frameId: currentSelections.frameId,
      accessoryId: currentSelections.accessoryId,
      title: avatar?.title ?? null,
    },
    items,
  };

  const activeItems = items.filter((i) => i.type === activeTab);

  return (
    <div className={cn(
      'rounded-2xl border border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 overflow-hidden',
      className
    )}>
      {/* Header + Avatar Preview */}
      <div className="bg-gradient-to-b from-amber-50/80 to-transparent px-6 pt-6 pb-4 dark:from-amber-950/20 dark:to-transparent">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            ✨ Avatar Editor
          </h3>
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                >
                  {updateMutation.isPending ? 'Saving...' : '💾 Save'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex justify-center">
          <AvatarDisplay avatar={previewData} size="lg" />
        </div>
      </div>

      {/* Tab Navigation — pill-style horizontal */}
      <div className="px-4 pt-2">
        <div className="flex gap-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/60">
          {itemTypes.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-150',
                activeTab === t.key
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              <span className="block text-base leading-none">{t.emoji}</span>
              <span className="mt-0.5 block">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="px-4 py-4">
        <ItemGrid
          items={activeItems}
          selectedId={
            currentSelections[
              `${activeTab.toLowerCase()}Id` as keyof typeof currentSelections
            ] as string | null
          }
          onSelect={(id) => handleSelect(activeTab, id)}
        />
        {activeItems.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No items in this category</p>
        )}
      </div>
    </div>
  );
}
