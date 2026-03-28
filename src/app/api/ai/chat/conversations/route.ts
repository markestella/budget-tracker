import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-utils';

export async function GET() {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const premiumBlock = await checkPremium(auth.user.id);
  if (premiumBlock) return premiumBlock;

  const conversations = await prisma.aIConversation.findMany({
    where: { userId: auth.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
    take: 50,
  });

  return jsonResponse({
    conversations: conversations.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt,
      messageCount: c._count.messages,
    })),
  });
}
