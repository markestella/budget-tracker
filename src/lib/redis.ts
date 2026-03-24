import { kv } from "@vercel/kv";

const isKvConfigured = () => {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

const logCacheError = (operation: string, error: unknown) => {
  console.error(`[redis] ${operation} failed`, error);
};

export const cacheKeys = {
  leaderboard: (type: string, period: string) => `leaderboard:${type}:${period}`,
  userGame: (userId: string) => `user-game:${userId}`,
  userProfile: (userId: string) => `user-profile:${userId}`,
  incomeOverview: (userId: string) => `income-overview:${userId}`,
  accountSummary: (userId: string) => `account-summary:${userId}`,
  system: (name: string) => `system:${name}`,
};

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isKvConfigured()) {
    return null;
  }

  try {
    const value = await kv.get<T>(key);
    return value ?? null;
  } catch (error) {
    logCacheError(`get ${key}`, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number,
): Promise<void> {
  if (!isKvConfigured()) {
    return;
  }

  try {
    if (ttlSeconds && ttlSeconds > 0) {
      await kv.set(key, value, { ex: ttlSeconds });
      return;
    }

    await kv.set(key, value);
  } catch (error) {
    logCacheError(`set ${key}`, error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!isKvConfigured()) {
    return;
  }

  try {
    const keys: string[] = [];

    for await (const key of kv.scanIterator({ match: pattern, count: 100 })) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return;
    }

    await kv.del(...keys);
  } catch (error) {
    logCacheError(`invalidate ${pattern}`, error);
  }
}

export async function incrementCache(
  key: string,
  by = 1,
): Promise<number> {
  if (!isKvConfigured()) {
    return 0;
  }

  try {
    return await kv.incrby(key, by);
  } catch (error) {
    logCacheError(`increment ${key}`, error);
    return 0;
  }
}

export { isKvConfigured };