import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { assignAllQuests } from '@/lib/game/quests/questAssigner';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    // Auto-assign quests if needed
    await assignAllQuests(auth.user.id);

    const now = new Date();

    // Expire past-due
    await prisma.userQuest.updateMany({
      where: { userId: auth.user.id, status: 'ACTIVE', expiresAt: { lt: now } },
      data: { status: 'EXPIRED' },
    });

    const quests = await prisma.userQuest.findMany({
      where: { userId: auth.user.id, status: 'ACTIVE' },
      include: { questDefinition: true },
      orderBy: { assignedAt: 'desc' },
    });

    return jsonResponse(quests);
  } catch (error) {
    console.error('Error fetching active quests:', error);
    return errorResponse('Failed to fetch active quests', 500);
  }
}
