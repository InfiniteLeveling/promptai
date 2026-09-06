export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  remaining: number;
  resetTimeMs: number;
}

export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly hits: Map<string, number[]> = new Map();

  constructor(options: RateLimitOptions = { windowMs: 60000, maxRequests: 60 }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.hits.get(key) || [];
    // Remove expired timestamps
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldestHit = timestamps[0];
      const resetTimeMs = oldestHit + this.windowMs;

      return {
        allowed: false,
        currentCount: timestamps.length,
        remaining: 0,
        resetTimeMs
      };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    return {
      allowed: true,
      currentCount: timestamps.length,
      remaining: this.maxRequests - timestamps.length,
      resetTimeMs: now + this.windowMs
    };
  }

  reset(key?: string) {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }
}
