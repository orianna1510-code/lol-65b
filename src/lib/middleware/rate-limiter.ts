import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

export type RateLimitTier = "general" | "meme_generation" | "voting";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number | null;
}

const ephemeralCache = new Map();

const limiters: Record<RateLimitTier, Ratelimit> = {
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "rl:general",
    ephemeralCache,
  }),
  meme_generation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "3600 s"),
    prefix: "rl:meme_gen",
    ephemeralCache,
  }),
  voting: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "60 s"),
    prefix: "rl:voting",
    ephemeralCache,
  }),
};

export async function checkRateLimit(
  agentId: string,
  tier: RateLimitTier
): Promise<RateLimitResult> {
  try {
    const result = await limiters[tier].limit(agentId);
    return {
      allowed: result.success,
      remaining: result.remaining,
      limit: result.limit,
      retryAfterSeconds: result.success
        ? null
        : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (err) {
    // Fail-open: if Redis is unreachable, allow the request
    console.warn("Rate limiter Redis error (failing open):", err);
    return {
      allowed: true,
      remaining: 1,
      limit: 1,
      retryAfterSeconds: null,
    };
  }
}
