import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { checkRateLimit, generateText, isGeminiConfigured } from '@/lib/ai/geminiService';
import { buildFinancialContext } from '@/lib/ai/contextBuilder';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { chatMessageSchema } from '@/lib/validations/ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const auth = await resolveAuthenticatedUser();
  if ('response' in auth) return auth.response;

  const premiumBlock = await checkPremium(auth.user.id);
  if (premiumBlock) return premiumBlock;

  if (!isGeminiConfigured()) {
    return errorResponse('AI features are not configured', 503);
  }

  const allowed = await checkRateLimit(auth.user.id);
  if (!allowed) {
    return errorResponse('Please wait before making more AI requests', 429);
  }

  const body = await request.json();
  const validation = validateRequest(chatMessageSchema, body);
  if ('error' in validation) return validation.error;

  const { message, conversationId } = validation.data;

  // Get or create conversation
  let conversation;
  let previousMessages: { role: string; content: string }[] = [];

  if (conversationId) {
    conversation = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId: auth.user.id },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
    });
    if (!conversation) {
      return errorResponse('Conversation not found', 404);
    }
    previousMessages = conversation.messages.map((m) => ({ role: m.role.toLowerCase(), content: m.content }));
  } else {
    // Create new conversation — derive title from first message
    const title = message.length > 50 ? message.slice(0, 47) + '...' : message;
    conversation = await prisma.aIConversation.create({
      data: { userId: auth.user.id, title },
    });
  }

  // Save user message
  await prisma.aIMessage.create({
    data: { conversationId: conversation.id, role: 'USER', content: message },
  });

  // Build context and call Gemini
  const context = await buildFinancialContext(auth.user.id);
  const historyText = previousMessages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `${context}\n\n${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}User: ${message}\n\nRespond as MoneyQuest AI. Be concise, friendly, and reference the user's actual financial data when relevant.`;

  try {
    const response = await generateText(prompt);

    // Save assistant message
    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: 'ASSISTANT', content: response },
    });

    // Update conversation timestamp
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return jsonResponse({
      conversationId: conversation.id,
      message: response,
    });
  } catch {
    return errorResponse('Failed to generate response. Please try again.', 503);
  }
}
