import fs from "fs";
import path from "path";

const GIST_FILE = "tolwex.db.b64";

function syncConfig() {
  const gistId = process.env.DB_GIST_ID || "";
  const token = process.env.DB_SYNC_TOKEN || process.env.GITHUB_TOKEN || "";
  return { gistId, token, enabled: Boolean(gistId && token) };
}

/** Pull durable DB from private GitHub gist into target path. */
export async function pullDurableDb(target: string): Promise<boolean> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return false;

  try {
    const metaRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "tolwex-db-sync",
      },
      cache: "no-store",
    });
    if (!metaRes.ok) return false;
    const meta = (await metaRes.json()) as {
      files?: Record<string, { raw_url?: string; content?: string }>;
    };
    const file = meta.files?.[GIST_FILE];
    if (!file) return false;

    let b64 = file.content || "";
    if (file.raw_url) {
      const rawRes = await fetch(file.raw_url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.raw",
          "User-Agent": "tolwex-db-sync",
        },
        cache: "no-store",
      });
      if (rawRes.ok) b64 = await rawRes.text();
    }
    b64 = b64.replace(/\s+/g, "");
    if (!b64 || b64.length < 100) return false;

    const buf = Buffer.from(b64, "base64");
    if (buf.length < 100) return false;

    fs.mkdirSync(path.dirname(target), { recursive: true });
    const tmp = `${target}.pull`;
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, target);
    return true;
  } catch {
    return false;
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pushInFlight: Promise<void> | null = null;

/** Push local DB to gist (debounced). */
export function scheduleDurableDbPush(source: string): void {
  const { enabled } = syncConfig();
  if (!enabled) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushInFlight = pushDurableDb(source)
      .then(() => undefined)
      .finally(() => {
        pushInFlight = null;
      });
  }, 400);
}

export async function pushDurableDb(source: string): Promise<boolean> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return false;
  if (!fs.existsSync(source)) return false;

  try {
    const b64 = fs.readFileSync(source).toString("base64");
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "tolwex-db-sync",
      },
      body: JSON.stringify({
        files: {
          [GIST_FILE]: { content: b64 },
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function flushDurableDbPush(): Promise<void> {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (pushInFlight) await pushInFlight;
  const target = process.env.DATABASE_URL?.replace(/^file:/, "") || "";
  if (target) await pushDurableDb(target);
}
