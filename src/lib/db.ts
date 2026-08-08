import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { pullDurableDb, scheduleDurableDbPush } from "@/lib/db-sync";
import { pullMembersFromGist } from "@/lib/members-durable";

/**
 * On Vercel, filesystem is read-only except /tmp.
 * Seed → /tmp, then durable gist overlay (full DB + members.json).
 */
function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const isFile =
    configured.startsWith("file:") ||
    configured.startsWith("sqlite:") ||
    (!configured.includes("://") && configured.includes(".db"));

  const onVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV != null;
  if (!onVercel || !isFile) {
    return configured.startsWith("file:") || configured.includes("://")
      ? configured
      : `file:${configured}`;
  }

  const target = "/tmp/tolwex.db";
  const sourceCandidates = [
    path.join(process.cwd(), "prisma", "data.db"),
    path.join(process.cwd(), "prisma", "runtime.db"),
    path.join(__dirname, "..", "..", "prisma", "data.db"),
    path.join(process.cwd(), "data.db"),
  ];

  try {
    if (!fs.existsSync(target)) {
      const source = sourceCandidates.find((p) => fs.existsSync(p));
      if (source) fs.copyFileSync(source, target);
    }
  } catch {
    // Prisma will surface missing DB errors
  }

  process.env.DATABASE_URL = `file:${target}`;
  return `file:${target}`;
}

const dbUrl = resolveDatabaseUrl();
export const dbFilePath = dbUrl.startsWith("file:") ? dbUrl.slice("file:".length) : "";

let hydratePromise: Promise<void> | null = null;

/** Ensure durable data is pulled (once per cold start, or forced). */
export function ensureDbHydrated(force = false): Promise<void> {
  if (force) hydratePromise = null;
  if (!hydratePromise) {
    hydratePromise = (async () => {
      if (!dbFilePath) return;
      if (!process.env.DB_GIST_ID || !(process.env.DB_SYNC_TOKEN || process.env.GITHUB_TOKEN)) {
        return;
      }
      // Full DB snapshot (orders/settings) — best effort
      await pullDurableDb(dbFilePath);
      // Members.json is the auth source of truth
      await pullMembersFromGist();
    })().catch(() => undefined);
  }
  return hydratePromise;
}

const MUTATING = new Set([
  "create",
  "update",
  "upsert",
  "delete",
  "createMany",
  "updateMany",
  "deleteMany",
]);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }) {
          await ensureDbHydrated();
          const result = await query(args);
          if (MUTATING.has(operation) && dbFilePath) {
            scheduleDurableDbPush(dbFilePath);
          }
          return result;
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
