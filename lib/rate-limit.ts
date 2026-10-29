/**
 * Fixed-window counters kept in memory. Fine for the single Node process the site runs in;
 * counters reset when the server restarts.
 */
type Bucket = { count: number; resetAt: number }

export type RateLimiter = {
  /** Seconds to wait before retrying, or 0 when the key is under the limit. */
  retryAfter(key: string): number
  /** Records one attempt for the key. */
  hit(key: string): void
  /** Records one attempt and returns the seconds to wait, or 0 when it is allowed. */
  consume(key: string): number
  reset(key: string): void
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: {
  limit: number
  windowMs: number
  maxKeys?: number
}): RateLimiter {
  const buckets = new Map<string, Bucket>()

  function prune(now: number) {
    for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key)
    // Still too many live keys (e.g. a flood of spoofed identifiers): drop the oldest ones.
    for (const key of buckets.keys()) {
      if (buckets.size <= maxKeys) break
      buckets.delete(key)
    }
  }

  function current(key: string, now: number): Bucket | undefined {
    const b = buckets.get(key)
    if (b && b.resetAt <= now) {
      buckets.delete(key)
      return undefined
    }
    return b
  }

  function retryAfter(key: string): number {
    const now = Date.now()
    const b = current(key, now)
    return b && b.count >= limit ? Math.ceil((b.resetAt - now) / 1000) : 0
  }

  function hit(key: string) {
    const now = Date.now()
    const b = current(key, now)
    if (b) b.count += 1
    else {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      if (buckets.size > maxKeys) prune(now)
    }
  }

  return {
    retryAfter,
    hit,
    consume(key) {
      const wait = retryAfter(key)
      if (wait) return wait
      hit(key)
      return 0
    },
    reset(key) {
      buckets.delete(key)
    },
  }
}
