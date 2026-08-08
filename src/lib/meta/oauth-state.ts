import { prisma } from "@/lib/db";
import { createOAuthState, safeEqual } from "@/lib/meta/oauth";

const STATE_TTL_MS = 15 * 60 * 1000;

/** Create a fresh one-time OAuth state (DB + return value). Clears prior unused states for visitor. */
export async function issueOAuthState(visitorId: string): Promise<string> {
  const state = createOAuthState();
  const expiresAt = new Date(Date.now() + STATE_TTL_MS);

  // Prevent stale states from blocking reconnects
  await prisma.oAuthState.deleteMany({
    where: {
      visitorId,
      OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }],
    },
  });

  await prisma.oAuthState.create({
    data: { state, visitorId, expiresAt },
  });

  return state;
}

/**
 * Validate and consume OAuth state.
 * Accepts either DB-backed state or legacy session state.
 */
export async function consumeOAuthState(params: {
  state: string | null;
  sessionState?: string;
  sessionExpiresAt?: number;
  visitorId?: string;
}): Promise<{ ok: true; visitorId: string } | { ok: false; reason: "csrf" | "expired" }> {
  if (!params.state) return { ok: false, reason: "csrf" };

  const row = await prisma.oAuthState.findUnique({ where: { state: params.state } });
  if (row) {
    if (row.usedAt) return { ok: false, reason: "csrf" };
    if (row.expiresAt.getTime() < Date.now()) {
      await prisma.oAuthState.delete({ where: { id: row.id } }).catch(() => null);
      return { ok: false, reason: "expired" };
    }
    await prisma.oAuthState.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
    return { ok: true, visitorId: row.visitorId };
  }

  // Legacy cookie-only fallback
  if (
    params.sessionState &&
    params.sessionExpiresAt &&
    Date.now() <= params.sessionExpiresAt &&
    safeEqual(params.state, params.sessionState)
  ) {
    return { ok: true, visitorId: params.visitorId || "" };
  }

  return { ok: false, reason: "csrf" };
}
