import { prisma } from '@/lib/prisma';
import { getOrCreateProfile } from './xpService';

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isYesterdayUTC(lastActive: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return isSameUTCDay(lastActive, yesterday);
}

const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];

export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  milestoneReached: number | null;
}> {
  const profile = await getOrCreateProfile(userId);
  const today = new Date();

  if (profile.lastActiveDate && isSameUTCDay(profile.lastActiveDate, today)) {
    return {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      milestoneReached: null,
    };
  }

  let newStreak: number;

  if (profile.lastActiveDate && isYesterdayUTC(profile.lastActiveDate, today)) {
    newStreak = profile.currentStreak + 1;
  } else if (profile.lastActiveDate) {
    // Gap detected — check for streak freeze
    const weekOf = getStartOfWeek(today);
    const freezeCount = await prisma.streakFreeze.count({
      where: { userId, weekOf },
    });

    if (freezeCount > 0) {
      newStreak = profile.currentStreak + 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, profile.longestStreak);

  await prisma.gameProfile.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    },
  });

  const milestoneReached = STREAK_MILESTONES.find((m) => newStreak === m) ?? null;

  return { currentStreak: newStreak, longestStreak: newLongest, milestoneReached };
}

export async function applyStreakFreeze(userId: string): Promise<{ success: boolean; remaining: number }> {
  const maxFreezes = 1; // Free tier
  const weekOf = getStartOfWeek(new Date());

  const usedThisWeek = await prisma.streakFreeze.count({
    where: { userId, weekOf },
  });

  if (usedThisWeek >= maxFreezes) {
    return { success: false, remaining: 0 };
  }

  await prisma.streakFreeze.create({
    data: { userId, weekOf },
  });

  return { success: true, remaining: maxFreezes - usedThisWeek - 1 };
}

export async function getStreakInfo(userId: string) {
  const profile = await getOrCreateProfile(userId);
  const weekOf = getStartOfWeek(new Date());
  const maxFreezes = 1;

  const usedThisWeek = await prisma.streakFreeze.count({
    where: { userId, weekOf },
  });

  const now = new Date();
  const isAtRisk =
    profile.currentStreak > 0 &&
    profile.lastActiveDate !== null &&
    !isSameUTCDay(profile.lastActiveDate, now) &&
    now.getUTCHours() >= 18;

  const nextMilestone = STREAK_MILESTONES.find((m) => m > profile.currentStreak) ?? null;

  return {
    current: profile.currentStreak,
    longest: profile.longestStreak,
    isAtRisk,
    freezesRemaining: Math.max(0, maxFreezes - usedThisWeek),
    nextMilestone,
    lastActiveDate: profile.lastActiveDate,
  };
}
