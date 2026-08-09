import { PrismaClient } from "@prisma/client";

const ORDERS_FILE = "orders.json";

export type DurableOrder = {
  id: string;
  memberId: string;
  serviceId: string | null;
  providerServiceId: number;
  serviceName: string;
  serviceType: string;
  link: string;
  quantity: number;
  charge: number;
  cost: number;
  status: string;
  providerOrderId: string | null;
  startCounter: number | null;
  remains: number | null;
  comments: string;
  dripfeedRuns: number | null;
  dripfeedInterval: number | null;
  errorMessage: string | null;
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
    "User-Agent": "tolwex-orders-sync",
  };
}

function newClient() {
  return new PrismaClient({ log: ["error"] });
}

async function readOrdersFromGist(
  gistId: string,
  token: string
): Promise<{ ok: true; list: DurableOrder[] } | { ok: false; error: string }> {
  const metaRes = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: gistHeaders(token),
    cache: "no-store",
  });
  if (!metaRes.ok) return { ok: false, error: `gist meta ${metaRes.status}` };
  const meta = (await metaRes.json()) as {
    files?: Record<string, { raw_url?: string; content?: string }>;
  };
  const file = meta.files?.[ORDERS_FILE];
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
    const list = JSON.parse(text) as DurableOrder[];
    if (!Array.isArray(list)) return { ok: false, error: "orders.json bozuk" };
    return { ok: true, list };
  } catch {
    return { ok: false, error: "orders.json parse hatası" };
  }
}

async function writeOrdersToGist(
  gistId: string,
  token: string,
  list: DurableOrder[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  // Cap size — keep newest 800
  const trimmed = list
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 800)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: { ...gistHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      files: { [ORDERS_FILE]: { content: JSON.stringify(trimmed) } },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false, count: trimmed.length, error: `gist ${res.status} ${t.slice(0, 140)}` };
  }
  return { ok: true, count: trimmed.length };
}

function toDurable(o: {
  id: string;
  memberId: string;
  serviceId: string | null;
  providerServiceId: number;
  serviceName: string;
  serviceType: string;
  link: string;
  quantity: number;
  charge: number;
  cost: number;
  status: string;
  providerOrderId: string | null;
  startCounter: number | null;
  remains: number | null;
  comments: string;
  dripfeedRuns: number | null;
  dripfeedInterval: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  member?: { username?: string; email?: string } | null;
}): DurableOrder {
  return {
    id: o.id,
    memberId: o.memberId,
    serviceId: o.serviceId,
    providerServiceId: o.providerServiceId,
    serviceName: o.serviceName,
    serviceType: o.serviceType,
    link: o.link,
    quantity: o.quantity,
    charge: o.charge,
    cost: o.cost,
    status: o.status,
    providerOrderId: o.providerOrderId,
    startCounter: o.startCounter,
    remains: o.remains,
    comments: o.comments || "",
    dripfeedRuns: o.dripfeedRuns,
    dripfeedInterval: o.dripfeedInterval,
    errorMessage: o.errorMessage,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    memberUsername: o.member?.username,
    memberEmail: o.member?.email,
  };
}

/** Pull durable orders into local SQLite (members must exist). */
export async function pullOrdersFromGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const remote = await readOrdersFromGist(gistId, token);
    if (!remote.ok) return { ok: false, count: 0, error: remote.error };

    let count = 0;
    for (const o of remote.list) {
      if (!o?.id || !o.memberId || !Number.isFinite(Number(o.providerServiceId))) continue;
      const member = await db.member.findUnique({ where: { id: o.memberId }, select: { id: true } });
      if (!member) continue;

      const existing = await db.smmOrder.findUnique({ where: { id: o.id } });
      const remoteUpdated = o.updatedAt ? new Date(o.updatedAt).getTime() : 0;
      if (existing && existing.updatedAt.getTime() > remoteUpdated) continue;

      const service =
        o.serviceId != null
          ? await db.smmService.findUnique({ where: { id: o.serviceId }, select: { id: true } })
          : null;

      await db.smmOrder.upsert({
        where: { id: o.id },
        create: {
          id: o.id,
          memberId: o.memberId,
          serviceId: service?.id || null,
          providerServiceId: Number(o.providerServiceId),
          serviceName: o.serviceName || "",
          serviceType: o.serviceType || "Default",
          link: o.link || "",
          quantity: Number(o.quantity) || 0,
          charge: Number(o.charge) || 0,
          cost: Number(o.cost) || 0,
          status: o.status || "pending",
          providerOrderId: o.providerOrderId || null,
          startCounter: o.startCounter,
          remains: o.remains,
          comments: o.comments || "",
          dripfeedRuns: o.dripfeedRuns,
          dripfeedInterval: o.dripfeedInterval,
          errorMessage: o.errorMessage,
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        },
        update: {
          serviceId: service?.id || existing?.serviceId || null,
          serviceName: o.serviceName || "",
          serviceType: o.serviceType || "Default",
          link: o.link || "",
          quantity: Number(o.quantity) || 0,
          charge: Number(o.charge) || 0,
          cost: Number(o.cost) || 0,
          status: o.status || "pending",
          providerOrderId: o.providerOrderId || null,
          startCounter: o.startCounter,
          remains: o.remains,
          comments: o.comments || "",
          dripfeedRuns: o.dripfeedRuns,
          dripfeedInterval: o.dripfeedInterval,
          errorMessage: o.errorMessage,
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        },
      });
      count += 1;
    }
    return { ok: true, count };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "pull hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}

/** Union-merge local orders into gist (never wipe remote-only). */
export async function pushOrdersToGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, count: 0, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const remote = await readOrdersFromGist(gistId, token);
    if (!remote.ok) return { ok: false, count: 0, error: remote.error };

    const rows = await db.smmOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 800,
      include: { member: { select: { username: true, email: true } } },
    });

    const byId = new Map<string, DurableOrder>();
    for (const o of remote.list) {
      if (o?.id) byId.set(o.id, o);
    }
    for (const o of rows) {
      const next = toDurable(o);
      const prev = byId.get(o.id);
      const prevTs = prev?.updatedAt ? Date.parse(prev.updatedAt) : 0;
      if (!prev || new Date(o.updatedAt).getTime() >= prevTs) {
        byId.set(o.id, next);
      }
    }
    return writeOrdersToGist(gistId, token, [...byId.values()]);
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "push hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}

/** Upsert one order into gist immediately after create/update. */
export async function upsertOrderInGist(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: false, error: "DB sync env eksik" };

  const db = newClient();
  try {
    const row = await db.smmOrder.findUnique({
      where: { id: orderId },
      include: { member: { select: { username: true, email: true } } },
    });
    if (!row) return { ok: false, error: "order yok" };

    const remote = await readOrdersFromGist(gistId, token);
    if (!remote.ok) return { ok: false, error: remote.error };

    const next = toDurable(row);
    const list = [...remote.list];
    const idx = list.findIndex((o) => o.id === next.id);
    if (idx >= 0) list[idx] = next;
    else list.push(next);

    const written = await writeOrdersToGist(gistId, token, list);
    return written.ok ? { ok: true } : { ok: false, error: written.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "upsert hata" };
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}
