'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  useGameAvatarQuery,
  useUpdateAvatarMutation,
  AvatarItemData,
} from '@/hooks/api/useGameAvatar';
import { AvatarDisplay } from './AvatarDisplay';
import Button from '@/components/ui/Button';

const itemTypes = [
  { key: 'BASE', label: '😊 Base' },
  { key: 'HAT', label: '🎩 Hats' },
  { key: 'BACKGROUND', label: '🖼️ BG' },
  { key: 'FRAME', label: '🖌️ Frame' },
  { key: 'ACCESSORY', label: '✨ Acc' },
];

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
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => (
        <motion.button
          key={item.id}
          whileHover={item.unlocked ? { scale: 1.08 } : undefined}
          whileTap={item.unlocked ? { scale: 0.95 } : undefined}
          onClick={() => item.unlocked && onSelect(item.id === selectedId ? null : item.id)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-lg border-2 p-2 text-center transition-colors',
            item.unlocked
              ? item.id === selectedId
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-transparent bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:hover:border-slate-600'
              : 'cursor-not-allowed border-transparent bg-slate-100 opacity-40 dark:bg-slate-800'
          )}
        >
          <span className="text-2xl">{item.imageUrl}</span>
          <span className="text-[10px] leading-tight line-clamp-1">
            {item.unlocked ? item.name : '🔒'}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export function AvatarEditor({ className }: { className?: string }) {
  const { data: avatarData, isLoading } = useGameAvatarQuery();
  const updateMutation = useUpdateAvatarMutation();

  const avatar = avatarData?.avatar;
  const items = avatarData?.items ?? [];

  const [selections, setSelections] = useState<{
    baseId: string;
    hatId: string | null;
    backgroundId: string | null;
    frameId: string | null;
    accessoryId: string | null;
  } | null>(null);

  // Initialize selections from current avatar
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
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Build preview avatar data with current selections
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

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Avatar</CardTitle>
          {hasChanges && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <AvatarDisplay avatar={previewData} size="lg" />

          <Tabs defaultValue="BASE" className="w-full">
            <TabsList>
              {itemTypes.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {itemTypes.map((t) => (
              <TabsContent key={t.key} value={t.key} className="mt-3">
                <ItemGrid
                  items={items.filter((i) => i.type === t.key)}
                  selectedId={
                    currentSelections[
                      `${t.key.toLowerCase()}Id` as keyof typeof currentSelections
                    ] as string | null
                  }
                  onSelect={(id) => handleSelect(t.key, id)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
