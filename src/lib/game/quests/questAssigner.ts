import { prisma } from '@/lib/prisma';
import { QUEST_POOL } from './questPool';

function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const daysUntilSunday = 7 - day;
  d.setUTCDate(d.getUTCDate() + daysUntilSunday);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

function getEndOfMonth(date: Date): Date {
  const d = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function getYesterdayQuestIds(userId: string): Promise<string[]> {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const yesterdayQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      assignedAt: { gte: getStartOfDay(yesterday), lte: getEndOfDay(yesterday) },
    },
    select: { questDefinitionId: true },
  });

  return yesterdayQuests.map((q) => q.questDefinitionId);
}

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function ensureQuestDefinitionsSeeded() {
  const count = await prisma.questDefinition.count();
  if (count > 0) return;

  await prisma.questDefinition.createMany({
    data: QUEST_POOL.map((q) => ({
      title: q.title,
      description: q.description,
      type: q.type,
      xpReward: q.xpReward,
      category: q.category,
      conditions: q.conditions,
    })),
  });
}

export async function assignDailyQuests(userId: string) {
  await ensureQuestDefinitionsSeeded();

  const today = new Date();
  const existingToday = await prisma.userQuest.count({
    where: {
      userId,
      assignedAt: { gte: getStartOfDay(today) },
      questDefinition: { type: 'DAILY' },
    },
  });

  if (existingToday > 0) return [];

  const yesterdayIds = await getYesterdayQuestIds(userId);

  const available = await prisma.questDefinition.findMany({
    where: {
      type: 'DAILY',
      isActive: true,
      ...(yesterdayIds.length > 0 ? { id: { notIn: yesterdayIds } } : {}),
    },
  });

  const selected = pickRandom(available, 3);
  const expiresAt = getEndOfDay(today);

  const quests = await Promise.all(
    selected.map((q) =>
      prisma.userQuest.create({
        data: {
          userId,
          questDefinitionId: q.id,
          expiresAt,
        },
        include: { questDefinition: true },
      }),
    ),
  );

  return quests;
}

export async function assignWeeklyQuests(userId: string) {
  await ensureQuestDefinitionsSeeded();

  const today = new Date();
  const startOfWeek = getStartOfDay(new Date(today));
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());

  const existingThisWeek = await prisma.userQuest.count({
    where: {
      userId,
      assignedAt: { gte: startOfWeek },
      questDefinition: { type: 'WEEKLY' },
    },
  });

  if (existingThisWeek > 0) return [];

  const available = await prisma.questDefinition.findMany({
    where: { type: 'WEEKLY', isActive: true },
  });

  const selected = pickRandom(available, 2);
  const expiresAt = getEndOfWeek(today);

  const quests = await Promise.all(
    selected.map((q) =>
      prisma.userQuest.create({
        data: { userId, questDefinitionId: q.id, expiresAt },
        include: { questDefinition: true },
      }),
    ),
  );

  return quests;
}

export async function assignMonthlyQuest(userId: string) {
  await ensureQuestDefinitionsSeeded();

  const today = new Date();
  const startOfMonth = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);

  const existingThisMonth = await prisma.userQuest.count({
    where: {
      userId,
      assignedAt: { gte: startOfMonth },
      questDefinition: { type: 'MONTHLY' },
    },
  });

  if (existingThisMonth > 0) return [];

  const available = await prisma.questDefinition.findMany({
    where: { type: 'MONTHLY', isActive: true },
  });

  const selected = pickRandom(available, 1);
  if (selected.length === 0) return [];

  const expiresAt = getEndOfMonth(today);

  const quest = await prisma.userQuest.create({
    data: { userId, questDefinitionId: selected[0].id, expiresAt },
    include: { questDefinition: true },
  });

  return [quest];
}

export async function assignAllQuests(userId: string) {
  const [daily, weekly, monthly] = await Promise.all([
    assignDailyQuests(userId),
    assignWeeklyQuests(userId),
    assignMonthlyQuest(userId),
  ]);

  return { daily, weekly, monthly };
}
