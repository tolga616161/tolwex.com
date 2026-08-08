import { PrismaClient } from "@prisma/client";

const PAYMENTS_FILE = "balance-requests.json";

type DurablePayment = {
  id: string;
  memberId: string;
  amount: number;
  method: string;
  note: string;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  memberUsername?: string;
  memberEmail?: string;
};

function syncConfig() {
  const gistId = process.env.DB_GIST_ID || "";
  const token = process.env.DB_SYNC_TOKEN || process.env.GITHUB_TOKEN || "";
  return { gistId, token, enabled: Boolean(gistId && token) };
}

function gistHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "tolwex-payments-sync",
  };
}

function newClient() {
  return new PrismaClient({ log: ["error"] });
}

async function readGistFile(gistId: string, token: string, file: string): Promise<string | null> {
  const metaRes = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: gistHeaders(token),
    cache: "no-store",
  });
  if (!metaRes.ok) return null;
  const meta = (await metaRes.json()) as {
    files?: Record<string, { raw_url?: string; content?: string }>;
  };
  const f = meta.files?.[file];
  if (!f) return "[]";
  let text = f.content || "[]";
  if (f.raw_url) {
    const rawRes = await fetch(f.raw_url, {
      headers: gistHeaders(token),
      cache: "no-store",
    });
    if (rawRes.ok) text = await rawRes.text();
  }
  return text || "[]";
}

/** Pull payment notifications into local SQLite. */
export async function pullPaymentsFromGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const text = await readGistFile(gistId, token, PAYMENTS_FILE);
    if (text == null) return { ok: false, count: 0, error: "gist okunamadı" };
    const list = JSON.parse(text) as DurablePayment[];
    if (!Array.isArray(list)) return { ok: false, count: 0, error: "payments json bozuk" };

    for (const p of list) {
      if (!p?.id || !p.memberId || !Number.isFinite(Number(p.amount))) continue;
      const member = await db.member.findUnique({ where: { id: p.memberId }, select: { id: true } });
      if (!member) continue; // member must exist first

      const existing = await db.balanceRequest.findUnique({ where: { id: p.id } });
      const remoteUpdated = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
      if (existing && existing.updatedAt.getTime() > remoteUpdated) continue;

      await db.balanceRequest.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          memberId: p.memberId,
          amount: Number(p.amount),
          method: p.method || "bank_transfer",
          note: p.note || "",
          status: p.status || "pending",
          adminNote: p.adminNote || "",
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        },
        update: {
          amount: Number(p.amount),
          method: p.method || "bank_transfer",
          note: p.note || "",
          status: p.status || "pending",
          adminNote: p.adminNote || "",
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        },
      });
    }
    return { ok: true, count: list.length };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "pull hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}

/** Push all balance requests to gist. */
export async function pushPaymentsToGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const rows = await db.balanceRequest.findMany({
      orderBy: { createdAt: "asc" },
      include: { member: { select: { username: true, email: true } } },
      take: 500,
    });
    const payload: DurablePayment[] = rows.map((r) => ({
      id: r.id,
      memberId: r.memberId,
      amount: r.amount,
      method: r.method,
      note: r.note,
      status: r.status,
      adminNote: r.adminNote,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      memberUsername: r.member?.username,
      memberEmail: r.member?.email,
    }));

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: { ...gistHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        files: { [PAYMENTS_FILE]: { content: JSON.stringify(payload) } },
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, count: payload.length, error: `gist ${res.status} ${t.slice(0, 120)}` };
    }
    return { ok: true, count: payload.length };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "push hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}
