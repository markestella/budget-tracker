import { resolveAuthenticatedUser } from '@/lib/session-user';
import { checkPremium } from '@/lib/ai/premiumGate';
import { checkRateLimit, generateWithVision, isGeminiConfigured } from '@/lib/ai/geminiService';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { NextRequest } from 'next/server';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

  const formData = await request.formData();
  const file = formData.get('receipt') as File | null;

  if (!file) {
    return errorResponse('No receipt image provided', 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return errorResponse('Only JPEG, PNG, and WEBP images are accepted', 400);
  }

  if (file.size > MAX_SIZE) {
    return errorResponse('Image must be smaller than 5MB', 400);
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  const prompt = `Extract data from this receipt image. Return JSON with:
{
  "merchantName": "store name",
  "totalAmount": 123.45,
  "date": "YYYY-MM-DD",
  "items": [{"name": "item", "amount": 12.34}],
  "suggestedCategory": "FOOD_DINING"
}

Use these categories: HOUSING, TRANSPORTATION, FOOD_DINING, UTILITIES, ENTERTAINMENT, HEALTHCARE, SAVINGS_ALLOCATION, DEBT_PAYMENTS, MISCELLANEOUS.
If a field can't be determined, use null. Return ONLY valid JSON, no markdown.`;

  try {
    const response = await generateWithVision(prompt, base64, file.type);
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);

    const scan = await prisma.receiptScan.create({
      data: {
        userId: auth.user.id,
        merchantName: data.merchantName ?? null,
        totalAmount: data.totalAmount ?? null,
        scanDate: data.date ? new Date(data.date) : null,
        items: data.items ?? null,
        suggestedCategory: data.suggestedCategory ?? null,
        status: 'PENDING',
      },
    });

    return jsonResponse({ scan, extracted: data });
  } catch {
    return errorResponse('Failed to process receipt image. Please try a clearer photo.', 503);
  }
}
