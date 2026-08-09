import { PrismaClient } from "@prisma/client";
import { createTtlGate } from "@/lib/ttl-cache";

const MEMBERS_FILE = "members.json";
const membersPullGate = createTtlGate(45_000);

export type DurableMember = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  balance: number;
  spent: number;
  apiKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
    "User-Agent": "tolwex-members-sync",
  };
}

function newClient() {
  return new PrismaClient({ log: ["error"] });
}

function randomKey() {
  return `tw_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

async function readMembersFromGist(
  gistId: string,
  token: string
): Promise<{ ok: true; list: DurableMember[] } | { ok: false; error: string }> {
  const metaRes = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: gistHeaders(token),
    cache: "no-store",
  });
  if (!metaRes.ok) return { ok: false, error: `gist meta ${metaRes.status}` };

  const meta = (await metaRes.json()) as {
    files?: Record<string, { raw_url?: string; content?: string }>;
  };
  const file = meta.files?.[MEMBERS_FILE];
  if (!file) return { ok: true, list: [] };

  let text = file.content || "[]";
  if (file.raw_url) {
    const rawRes = await fetch(file.raw_url, {
      headers: gistHeaders(token),
      cache: "no-store",
    });
    if (rawRes.ok) text = await rawRes.text();
  }
  if (!text.trim()) return { ok: true, list: [] };

  try {
    const list = JSON.parse(text) as DurableMember[];
    if (!Array.isArray(list)) return { ok: false, error: "members.json bozuk" };
    return { ok: true, list };
  } catch {
    return { ok: false, error: "members.json parse hatası" };
  }
}

async function writeMembersToGist(
  gistId: string,
  token: string,
  list: DurableMember[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      ...gistHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: {
        [MEMBERS_FILE]: { content: JSON.stringify(list) },
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false, count: list.length, error: `gist ${res.status} ${t.slice(0, 160)}` };
  }
  return { ok: true, count: list.length };
}

function toDurable(m: {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  balance: number;
  spent: number;
  apiKey: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): DurableMember {
  return {
    id: m.id,
    username: m.username,
    email: m.email,
    passwordHash: m.passwordHash,
    name: m.name,
    phone: m.phone,
    balance: m.balance,
    spent: m.spent,
    apiKey: m.apiKey,
    active: m.active,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

/** Upsert one member into gist without wiping other accounts (auth source of truth). */
export async function upsertMemberInGist(member: {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  balance: number;
  spent: number;
  apiKey: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  try {
    const remote = await readMembersFromGist(gistId, token);
    if (!remote.ok) return { ok: false, count: 0, error: remote.error };

    const next = toDurable(member);
    const list = [...remote.list];
    const idx = list.findIndex(
      (m) =>
        m.id === next.id ||
        m.username.toLowerCase() === next.username.toLowerCase() ||
        m.email.toLowerCase() === next.email.toLowerCase()
    );
    if (idx >= 0) {
      const prev = list[idx];
      const prevTs = prev.updatedAt ? new Date(prev.updatedAt).getTime() : 0;
      const nextTs = next.updatedAt ? new Date(next.updatedAt).getTime() : Date.now();
      // Newest write wins (debits must stick — never Math.max balance)
      if (nextTs >= prevTs) {
        list[idx] = { ...prev, ...next };
      }
    } else {
      list.push(next);
    }
    return writeMembersToGist(gistId, token, list);
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "upsert hata" };
  }
}

/** Pull members.json from gist and upsert into local SQLite. */
export async function pullMembersFromGist(
  opts?: { force?: boolean }
): Promise<{ ok: boolean; count: number; error?: string; cached?: boolean }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const gated = await membersPullGate.run(async () => {
    const db = newClient();
    try {
      const remote = await readMembersFromGist(gistId, token);
      if (!remote.ok) return { ok: false as const, count: 0, error: remote.error };
      const list = remote.list;

      for (const m of list) {
        if (!m?.id || !m.username || !m.email || !m.passwordHash) continue;
        const existing = await db.member.findUnique({ where: { id: m.id } });
        const remoteUpdated = m.updatedAt ? new Date(m.updatedAt).getTime() : 0;

        // Prefer newer local wallet numbers so concurrent deposits are not wiped
        if (existing && existing.updatedAt.getTime() > remoteUpdated) {
          await db.member.update({
            where: { id: m.id },
            data: {
              username: m.username.toLowerCase(),
              email: m.email.toLowerCase(),
              passwordHash: m.passwordHash,
              name: m.name || m.username,
              phone: m.phone || "",
              apiKey: m.apiKey || existing.apiKey || randomKey(),
              active: m.active !== false,
            },
          });
          continue;
        }
        await db.member.upsert({
          where: { id: m.id },
          create: {
            id: m.id,
            username: m.username.toLowerCase(),
            email: m.email.toLowerCase(),
            passwordHash: m.passwordHash,
            name: m.name || m.username,
            phone: m.phone || "",
            balance: Number(m.balance) || 0,
            spent: Number(m.spent) || 0,
            apiKey: m.apiKey || randomKey(),
            active: m.active !== false,
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
            updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
          },
          update: {
            username: m.username.toLowerCase(),
            email: m.email.toLowerCase(),
            passwordHash: m.passwordHash,
            name: m.name || m.username,
            phone: m.phone || "",
            balance: Number(m.balance) || 0,
            spent: Number(m.spent) || 0,
            apiKey: m.apiKey || randomKey(),
            active: m.active !== false,
            updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
          },
        });
      }
      return { ok: true as const, count: list.length };
    } catch (e) {
      return { ok: false as const, count: 0, error: e instanceof Error ? e.message : "pull hata" };
    } finally {
      await db.$disconnect().catch(() => undefined);
    }
  }, opts?.force);

  if ("cached" in gated && gated.cached) {
    return { ok: true, count: 0, cached: true };
  }
  return gated as { ok: boolean; count: number; error?: string };
}

/**
 * Union-merge local SQLite members into gist (never delete remote-only accounts).
 */
export async function pushMembersToGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const remote = await readMembersFromGist(gistId, token);
    if (!remote.ok) return { ok: false, count: 0, error: remote.error };

    const rows = await db.member.findMany({ orderBy: { createdAt: "asc" } });
    const byId = new Map<string, DurableMember>();
    for (const m of remote.list) {
      if (m?.id) byId.set(m.id, m);
    }
    for (const m of rows) {
      const next = toDurable(m);
      const prev = byId.get(m.id);
      if (!prev) {
        byId.set(m.id, next);
        continue;
      }
      const prevTs = prev.updatedAt ? new Date(prev.updatedAt).getTime() : 0;
      const nextTs = m.updatedAt.getTime();
      if (nextTs >= prevTs) {
        // Local row is newer — trust its wallet (orders debit, admin credit)
        byId.set(m.id, { ...prev, ...next });
      }
    }

    const payload = [...byId.values()];
    return writeMembersToGist(gistId, token, payload);
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "push hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}
