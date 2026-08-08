type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

/** Simple in-memory rate limiter (per-instance). Prefer CDN/WAF in production. */
export function rateLimit(key: string, limit: number, windowMs: number): {
  ok: boolean;
  remaining: number;
} {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}
