import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { checkRateLimit, generateText, isGeminiConfigured } from '@/lib/ai/geminiService';
import { jsonResponse, errorResponse, validateRequest } from '@/lib/api-utils';
import { categorizeSchema } from '@/lib/validations/ai';
import { NextRequest } from 'next/server';

const CATEGORIES = [
  'HOUSING', 'TRANSPORTATION', 'FOOD_DINING', 'UTILITIES',
  'ENTERTAINMENT', 'HEALTHCARE', 'SAVINGS_ALLOCATION',
  'DEBT_PAYMENTS', 'MISCELLANEOUS', 'CUSTOM',
];

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
  const validation = validateRequest(categorizeSchema, body);
  if ('error' in validation) return validation.error;

  const prompt = `Categorize this expense description into one of these budget categories: ${CATEGORIES.join(', ')}.

Description: "${validation.data.description}"

Return JSON with {category, confidence} where confidence is 0.0-1.0. Return ONLY valid JSON, no markdown.`;

  try {
    const response = await generateText(prompt);
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const result: { category: string; confidence: number } = JSON.parse(cleaned);

    // Validate the category is known
    if (!CATEGORIES.includes(result.category)) {
      result.category = 'MISCELLANEOUS';
      result.confidence = 0.3;
    }

    return jsonResponse(result);
  } catch {
    return jsonResponse({ category: 'MISCELLANEOUS', confidence: 0.1 });
  }
}
