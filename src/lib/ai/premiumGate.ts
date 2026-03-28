import { errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function checkPremium(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });
  if (!user?.isPremium) {
    return errorResponse('AI features require a premium subscription', 403);
  }
  return null;
}
