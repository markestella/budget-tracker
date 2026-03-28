import { prisma } from '@/lib/prisma';
import { getLevel, getXPProgress } from './levelCalculator';
import { XP_ACTIONS, type XPAction } from './xpConfig';

export interface AwardXPResult {
  xpGained: number;
  newTotal: number;
  leveledUp: boolean;
  newLevel: number;
  multiplierApplied?: number;
}

async function getActiveXPMultiplier(): Promise<number> {
  const now = new Date();
  const events = await prisma.seasonalEvent.findMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
      xpMultiplier: { gt: 1.0 },
    },
    select: { xpMultiplier: true },
  });
  if (events.length === 0) return 1;
  return Math.max(...events.map((e) => e.xpMultiplier));
}

export async function awardXP(
  userId: string,
  action: XPAction | string,
  customAmount?: number,
): Promise<AwardXPResult> {
  const baseAmount = customAmount ?? (XP_ACTIONS as Record<string, number>)[action] ?? 0;

  if (baseAmount <= 0) {
    const profile = await getOrCreateProfile(userId);
    return { xpGained: 0, newTotal: profile.xp, leveledUp: false, newLevel: profile.level };
  }

  const multiplier = await getActiveXPMultiplier();
  const amount = Math.round(baseAmount * multiplier);

  const profile = await prisma.gameProfile.upsert({
    where: { userId },
    create: { userId, xp: amount, level: getLevel(amount) },
    update: { xp: { increment: amount } },
  });

  const newLevel = getLevel(profile.xp);
  const leveledUp = newLevel > profile.level;

  if (leveledUp || profile.level === 1) {
    await prisma.gameProfile.update({
      where: { userId },
      data: { level: newLevel },
    });
  }

  await prisma.xPTransaction.create({
    data: { userId, amount, action, description: `Earned ${amount} XP for ${action}` },
  });

  return { xpGained: amount, newTotal: profile.xp, leveledUp, newLevel, multiplierApplied: multiplier > 1 ? multiplier : undefined };
}

export async function getOrCreateProfile(userId: string) {
  return prisma.gameProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function getGameProfileWithProgress(userId: string) {
  const profile = await getOrCreateProfile(userId);
  const progress = getXPProgress(profile.xp);

  return {
    ...profile,
    ...progress,
  };
}
