import { NextRequest } from 'next/server';
import { resolveAuthenticatedUser } from '@/lib/session-user';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { feedReactionSchema } from '@/lib/validations/social';
import { awardXP } from '@/lib/game/xpService';
import { invalidateCache } from '@/lib/redis';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;
  const userId = auth.user.id;
  const { id: achievementEventId } = await params;

  const body = await req.json();
  const validation = validateRequest(feedReactionSchema, body);
  if ('error' in validation) return validation.error;
  const { emoji } = validation.data;

  // Verify the achievement event exists
  const event = await prisma.achievementEvent.findUnique({
    where: { id: achievementEventId },
  });
  if (!event) {
    return errorResponse('Achievement event not found', 404);
  }

  // Prevent self-reactions
  if (event.userId === userId) {
    return errorResponse('Cannot react to your own achievement', 400);
  }

  // Check existing reaction
  const existing = await prisma.feedReaction.findUnique({
    where: {
      achievementEventId_userId: { achievementEventId, userId },
    },
  });

  if (existing) {
    if (existing.emoji === emoji) {
      // Same emoji — toggle off (remove)
      await prisma.feedReaction.delete({ where: { id: existing.id } });
      await invalidateCache('social:feed:*');
      return jsonResponse({ action: 'removed', emoji });
    }
    // Different emoji — update
    await prisma.feedReaction.update({
      where: { id: existing.id },
      data: { emoji },
    });
    await invalidateCache('social:feed:*');
    return jsonResponse({ action: 'updated', emoji });
  }

  // New reaction
  await prisma.feedReaction.create({
    data: { achievementEventId, userId, emoji },
  });

  // Award small XP for engagement
  await awardXP(userId, 'REACT_TO_ACHIEVEMENT');

  await invalidateCache('social:feed:*');

  return jsonResponse({ action: 'added', emoji }, { status: 201 });
}
