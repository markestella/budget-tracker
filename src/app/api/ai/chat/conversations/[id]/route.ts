import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { NextRequest } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const premiumBlock = await checkPremium(auth.user.id);
  if (premiumBlock) return premiumBlock;

  const { id } = await params;

  const conversation = await prisma.aIConversation.findFirst({
    where: { id, userId: auth.user.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!conversation) {
    return errorResponse('Conversation not found', 404);
  }

  return jsonResponse({ conversation });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const { id } = await params;

  const conversation = await prisma.aIConversation.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!conversation) {
    return errorResponse('Conversation not found', 404);
  }

  await prisma.aIConversation.delete({ where: { id } });

  return jsonResponse({ success: true });
}
