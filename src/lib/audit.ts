import { prisma } from "@/lib/db";

type ActorType = "system" | "visitor" | "admin";

/** Write an audit event. Never pass tokens, secrets, or passwords in metadata. */
export async function writeAuditLog(params: {
  action: string;
  actorType?: ActorType;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const safe = { ...(params.metadata || {}) };
  for (const key of Object.keys(safe)) {
    const lower = key.toLowerCase();
    if (
      lower.includes("token") ||
      lower.includes("secret") ||
      lower.includes("password") ||
      lower.includes("cookie") ||
      lower.includes("session")
    ) {
      delete safe[key];
    }
  }

  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        actorType: params.actorType || "system",
        actorId: params.actorId || null,
        metadata: JSON.stringify(safe),
      },
    });
  } catch {
    // Never block login/OAuth if audit DB is unavailable (e.g. cold SQLite on Vercel)
  }
}
