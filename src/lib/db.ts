import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

/**
 * On Vercel, the filesystem is read-only except /tmp.
 * Build creates prisma/data.db; we copy it to /tmp for writable Prisma access.
 */
function resolveDatabaseUrl(): void {
  if (process.env.PRISMA_DB_READY === "1") return;

  const configured = process.env.DATABASE_URL || "";
  const wantsTmp =
    configured.includes("/tmp/") ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV != null;

  if (!wantsTmp) {
    process.env.PRISMA_DB_READY = "1";
    return;
  }

  const target = "/tmp/tolwex.db";
  const sourceCandidates = [
    path.join(process.cwd(), "prisma", "data.db"),
    path.join(__dirname, "..", "..", "prisma", "data.db"),
    path.join(process.cwd(), "data.db"),
  ];

  try {
    if (!fs.existsSync(target)) {
      const source = sourceCandidates.find((p) => fs.existsSync(p));
      if (source) {
        fs.copyFileSync(source, target);
      }
    }
    process.env.DATABASE_URL = `file:${target}`;
  } catch {
    // Fall through — Prisma will surface the error
    process.env.DATABASE_URL = configured || `file:${target}`;
  }

  process.env.PRISMA_DB_READY = "1";
}

resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
