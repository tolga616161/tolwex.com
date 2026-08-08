import { PrismaClient } from "@prisma/client";

const MEMBERS_FILE = "members.json";

type DurableMember = {
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

/** Pull members.json from gist and upsert into local SQLite. */
export async function pullMembersFromGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const metaRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: gistHeaders(token),
      cache: "no-store",
    });
    if (!metaRes.ok) {
      return { ok: false, count: 0, error: `gist meta ${metaRes.status}` };
    }
    const meta = (await metaRes.json()) as {
      files?: Record<string, { raw_url?: string; content?: string }>;
    };
    const file = meta.files?.[MEMBERS_FILE];
    if (!file) return { ok: true, count: 0 };

    let text = file.content || "[]";
    if (file.raw_url) {
      const rawRes = await fetch(file.raw_url, {
        headers: gistHeaders(token),
        cache: "no-store",
      });
      if (rawRes.ok) text = await rawRes.text();
    }
    if (!text.trim()) return { ok: true, count: 0 };

    const list = JSON.parse(text) as DurableMember[];
    if (!Array.isArray(list)) return { ok: false, count: 0, error: "members.json bozuk" };

    for (const m of list) {
      if (!m?.id || !m.username || !m.email || !m.passwordHash) continue;
      const existing = await db.member.findUnique({ where: { id: m.id } });
      const remoteUpdated = m.updatedAt ? new Date(m.updatedAt).getTime() : 0;
      // Prefer newer local balance/spent so concurrent deposits are not wiped
      if (existing && existing.updatedAt.getTime() > remoteUpdated) {
        await db.member.update({
          where: { id: m.id },
          data: {
            username: m.username,
            email: m.email,
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
          username: m.username,
          email: m.email,
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
          username: m.username,
          email: m.email,
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
    return { ok: true, count: list.length };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "pull hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}

/** Push all local members to gist members.json (auth source of truth). */
export async function pushMembersToGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const rows = await db.member.findMany({ orderBy: { createdAt: "asc" } });
    const payload: DurableMember[] = rows.map((m) => ({
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
    }));

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        ...gistHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          [MEMBERS_FILE]: { content: JSON.stringify(payload) },
        },
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, count: payload.length, error: `gist ${res.status} ${t.slice(0, 160)}` };
    }
    return { ok: true, count: payload.length };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "push hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}
