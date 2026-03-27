import { awardXP } from './xpService';
import { updateStreak } from './streaks';
import { checkBadges, type GameEvent } from './badges/badgeChecker';
import { checkQuestProgress } from './quests/questProgressChecker';
import { checkNewUnlocks } from './avatar/avatarService';

export interface GameHookResult {
  xp: { xpGained: number; newTotal: number; leveledUp: boolean; newLevel: number } | null;
  streak: { currentStreak: number; longestStreak: number; milestoneReached: number | null } | null;
  badges: Array<{ key: string; name: string; icon: string; xpReward: number }>;
  quests: { completed: Array<{ questId: string; title: string; xpReward: number }> };
}

export async function afterFinancialAction(
  userId: string,
  event: GameEvent,
  xpAction?: string,
): Promise<GameHookResult> {
  // 1. Award XP
  const xpResult = xpAction
    ? await awardXP(userId, xpAction)
    : null;

  // 2. Update streak
  const streakResult = await updateStreak(userId);

  // 3. Check badges for the event
  let badges = await checkBadges(userId, event);

  // If streak milestone reached, also check streak badges
  if (streakResult.milestoneReached) {
    const streakBadges = await checkBadges(userId, 'STREAK_MILESTONE');
    badges = [...badges, ...streakBadges];
  }

  // If XP caused a level-up, check level badges and avatar unlocks
  if (xpResult?.leveledUp) {
    const levelBadges = await checkBadges(userId, 'LEVEL_UP');
    badges = [...badges, ...levelBadges];
    await checkNewUnlocks(userId);
  }

  // 4. Check quest progress
  const questResult = await checkQuestProgress(userId);

  return {
    xp: xpResult,
    streak: streakResult,
    badges,
    quests: { completed: questResult.completed },
  };
}
