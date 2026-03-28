import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCache, setCache } from '@/lib/redis';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW = 60; // seconds

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `ai:ratelimit:${userId}`;
  const count = await getCache<number>(key);
  if (count !== null && count >= RATE_LIMIT_MAX) {
    return false;
  }
  const newCount = (count ?? 0) + 1;
  await setCache(key, newCount, RATE_LIMIT_WINDOW);
  return true;
}

export async function generateText(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateWithVision(
  prompt: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const model = getModel();
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ]);
  return result.response.text();
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
