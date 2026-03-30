import { prisma } from '@/lib/prisma';
import type { AchievementEventType, Prisma } from '@prisma/client';

export async function createAchievementEvent({
  userId,
  eventType,
  displayText,
  metadata,
}: {
  userId: string;
  eventType: AchievementEventType;
  displayText: string;
  metadata?: Record<string, unknown>;
}) {
  // Check if user is opted in to leaderboard (public visibility)
  const optIn = await prisma.leaderboardOptIn.findUnique({
    where: { userId },
    select: { isOptedIn: true },
  });

  return prisma.achievementEvent.create({
    data: {
      userId,
      eventType,
      displayText,
      metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
      isPublic: optIn?.isOptedIn ?? false,
    },
  });
}
