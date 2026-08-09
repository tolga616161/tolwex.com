/** In-process TTL gate for expensive gist / sync work on warm Vercel instances. */

export function createTtlGate(ttlMs: number) {
  let last = 0;
  let inflight: Promise<unknown> | null = null;

  return {
    /** true if a fresh run is allowed (or force). */
    shouldRun(force = false) {
      if (force) return true;
      return Date.now() - last >= ttlMs || last === 0;
    },
    mark() {
      last = Date.now();
    },
    async run<T>(fn: () => Promise<T>, force = false): Promise<T | { ok: true; cached: true }> {
      if (!force && last > 0 && Date.now() - last < ttlMs) {
        return { ok: true as const, cached: true as const };
      }
      if (inflight) return inflight as Promise<T>;
      const p = (async () => {
        try {
          const result = await fn();
          last = Date.now();
          return result;
        } finally {
          inflight = null;
        }
      })();
      inflight = p;
      return p;
    },
    reset() {
      last = 0;
    },
  };
}
