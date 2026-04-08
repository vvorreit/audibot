import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch {
  // Redis not available, fallback to allow-all
}

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${limit}:${windowMs}`;
  if (!limiterCache.has(cacheKey)) {
    limiterCache.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        analytics: false,
        prefix: "audibot:rl",
      })
    );
  }
  return limiterCache.get(cacheKey)!;
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Falls back to allowing all requests if Redis is not configured.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  try {
    const limiter = getLimiter(limit, windowMs);
    if (!limiter) return true;
    const { success } = await limiter.limit(key);
    return success;
  } catch {
    // On Redis error, fail open (allow request)
    return true;
  }
}
