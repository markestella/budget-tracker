import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cacheKeys, getCache, incrementCache, isKvConfigured, setCache } from "@/lib/redis";

type RedisTestPayload = {
  databaseTime: string;
  source: "cache" | "database";
};

const redisTestKey = cacheKeys.system("redis-test");
const redisHitCounterKey = cacheKeys.system("redis-test:hits");

export async function GET() {
  try {
    const cachedPayload = await getCache<RedisTestPayload>(redisTestKey);

    if (cachedPayload) {
      const hits = await incrementCache(redisHitCounterKey);

      return NextResponse.json({
        ok: true,
        cache: "hit",
        kvConfigured: isKvConfigured(),
        hits,
        data: cachedPayload,
      });
    }

    const dbResult = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() AS now`;
    const databaseTime = dbResult[0]?.now instanceof Date
      ? dbResult[0].now.toISOString()
      : new Date(dbResult[0]?.now ?? Date.now()).toISOString();

    const payload: RedisTestPayload = {
      databaseTime,
      source: "database",
    };

    await setCache(redisTestKey, payload, 60);
    const hits = await incrementCache(redisHitCounterKey);

    return NextResponse.json({
      ok: true,
      cache: isKvConfigured() ? "miss" : "unavailable",
      kvConfigured: isKvConfigured(),
      hits,
      data: payload,
      fallback: "database",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        cache: "error",
        kvConfigured: isKvConfigured(),
        message: "Redis test failed before a fallback response could be completed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}