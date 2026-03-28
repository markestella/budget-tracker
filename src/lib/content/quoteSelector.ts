import { QUOTES, type Quote } from './quotes';
import { getCache, setCache } from '@/lib/redis';

const CACHE_KEY = 'quote:daily';
const CACHE_TTL = 86400; // 24 hours

/**
 * Deterministic daily quote selection.
 * Uses a hash of the UTC date string to produce a stable index.
 * All users see the same quote on the same day.
 */
function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function computeDailyQuote(): Quote {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC
  const index = hashDate(today) % QUOTES.length;
  return QUOTES[index];
}

export async function getDailyQuote(): Promise<Quote> {
  // Try cache first
  const cached = await getCache<Quote>(CACHE_KEY);
  if (cached) return cached;

  // Compute and cache
  const quote = computeDailyQuote();
  await setCache(CACHE_KEY, quote, CACHE_TTL);

  return quote;
}
