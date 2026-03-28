import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const events = await prisma.seasonalEvent.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'desc' },
    });

    return jsonResponse({ events });
  } catch (error) {
    console.error('Error fetching seasonal events:', error);
    return errorResponse('Failed to fetch seasonal events', 500);
  }
}
