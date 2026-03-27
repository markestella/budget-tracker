import { prisma } from '@/lib/prisma';
import { AVATAR_ITEMS } from './avatarItems';

async function ensureAvatarItemsSeeded() {
  const count = await prisma.avatarItem.count();
  if (count > 0) return;

  await prisma.avatarItem.createMany({
    data: AVATAR_ITEMS.map((item) => ({
      name: item.name,
      type: item.type,
      unlockCondition: item.unlockCondition,
      unlockValue: item.unlockValue,
      imageUrl: item.imageUrl,
    })),
  });
}

export async function getAvatar(userId: string) {
  await ensureAvatarItemsSeeded();

  let avatar = await prisma.userAvatar.findUnique({ where: { userId } });

  if (!avatar) {
    const defaultBase = await prisma.avatarItem.findFirst({
      where: { type: 'BASE', unlockCondition: 'FREE' },
    });

    if (defaultBase) {
      avatar = await prisma.userAvatar.create({
        data: { userId, baseId: defaultBase.id },
      });
    }
  }

  return avatar;
}

export async function getUnlockedItems(userId: string) {
  await ensureAvatarItemsSeeded();

  const [freeItems, unlockedRecords] = await Promise.all([
    prisma.avatarItem.findMany({
      where: { unlockCondition: 'FREE' },
    }),
    prisma.userAvatarItem.findMany({
      where: { userId },
      include: { avatarItem: true },
    }),
  ]);

  const unlockedItemIds = new Set(unlockedRecords.map((r) => r.avatarItemId));
  const allUnlocked = [...freeItems];

  for (const record of unlockedRecords) {
    if (!freeItems.some((f) => f.id === record.avatarItemId)) {
      allUnlocked.push(record.avatarItem);
    }
  }

  return { items: allUnlocked, unlockedIds: unlockedItemIds };
}

export async function getAllItemsWithStatus(userId: string) {
  await ensureAvatarItemsSeeded();

  const [allItems, userUnlocked] = await Promise.all([
    prisma.avatarItem.findMany({ orderBy: { type: 'asc' } }),
    prisma.userAvatarItem.findMany({
      where: { userId },
      select: { avatarItemId: true },
    }),
  ]);

  const unlockedSet = new Set(userUnlocked.map((u) => u.avatarItemId));

  return allItems.map((item) => ({
    ...item,
    unlocked: item.unlockCondition === 'FREE' || unlockedSet.has(item.id),
  }));
}

export async function checkNewUnlocks(userId: string) {
  await ensureAvatarItemsSeeded();

  const profile = await prisma.gameProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });
  const badgeKeys = new Set(userBadges.map((ub) => ub.badge.key));

  const allItems = await prisma.avatarItem.findMany({
    where: { unlockCondition: { in: ['LEVEL', 'BADGE'] } },
  });

  const alreadyUnlocked = await prisma.userAvatarItem.findMany({
    where: { userId },
    select: { avatarItemId: true },
  });
  const unlockedSet = new Set(alreadyUnlocked.map((u) => u.avatarItemId));

  const newUnlocks = [];

  for (const item of allItems) {
    if (unlockedSet.has(item.id)) continue;

    if (item.unlockCondition === 'LEVEL' && item.unlockValue) {
      const levelRequired = parseInt(item.unlockValue.replace('level:', ''), 10);
      if (profile.level >= levelRequired) {
        await prisma.userAvatarItem.create({
          data: { userId, avatarItemId: item.id },
        });
        newUnlocks.push(item);
      }
    }

    if (item.unlockCondition === 'BADGE' && item.unlockValue) {
      const badgeKey = item.unlockValue.replace('badge:', '');
      if (badgeKeys.has(badgeKey)) {
        await prisma.userAvatarItem.create({
          data: { userId, avatarItemId: item.id },
        });
        newUnlocks.push(item);
      }
    }
  }

  return newUnlocks;
}

export async function updateAvatar(
  userId: string,
  selections: {
    baseId?: string;
    hatId?: string | null;
    backgroundId?: string | null;
    frameId?: string | null;
    accessoryId?: string | null;
    title?: string | null;
  },
) {
  const { items, unlockedIds } = await getUnlockedItems(userId);
  const freeIds = new Set(items.filter((i) => i.unlockCondition === 'FREE').map((i) => i.id));

  // Validate all selected items are unlocked
  for (const [key, value] of Object.entries(selections)) {
    if (key === 'title' || !value) continue;
    if (!unlockedIds.has(value) && !freeIds.has(value)) {
      throw new Error(`Item ${value} is not unlocked`);
    }
  }

  return prisma.userAvatar.upsert({
    where: { userId },
    create: {
      userId,
      baseId: selections.baseId!,
      hatId: selections.hatId ?? null,
      backgroundId: selections.backgroundId ?? null,
      frameId: selections.frameId ?? null,
      accessoryId: selections.accessoryId ?? null,
      title: selections.title ?? null,
    },
    update: selections,
  });
}
