import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { resolveAuthenticatedUser } from '@/lib/session-user';

export async function GET() {
  try {
    const auth = await resolveAuthenticatedUser();
    if ('response' in auth) return auth.response;

    const quests = await prisma.userQuest.findMany({
      where: { userId: auth.user.id, status: 'COMPLETED' },
      include: { questDefinition: true },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    return jsonResponse(quests);
  } catch (error) {
    console.error('Error fetching quest history:', error);
    return errorResponse('Failed to fetch quest history', 500);
  }
}
