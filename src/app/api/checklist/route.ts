import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureVisitorSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const { visitorId } = await ensureVisitorSession();
  const row = await prisma.securityChecklist.findUnique({
    where: { visitorSessionId: visitorId },
  });

  return NextResponse.json({
    source: "user_self_report",
    notice:
      "Bu checklist Meta/Instagram API sonucu değildir. Kendi beyanınıza dayalı bir kontrol listesidir.",
    items: {
      twoFactorEnabled: row?.twoFactorEnabled ?? null,
      emailSecure: row?.emailSecure ?? null,
      phoneUpToDate: row?.phoneUpToDate ?? null,
      unknownDevices: row?.unknownDevices ?? null,
      suspiciousApps: row?.suspiciousApps ?? null,
      strongPassword: row?.strongPassword ?? null,
      backupCodesSafe: row?.backupCodesSafe ?? null,
    },
  });
}

const schema = z.object({
  twoFactorEnabled: z.boolean().nullable().optional(),
  emailSecure: z.boolean().nullable().optional(),
  phoneUpToDate: z.boolean().nullable().optional(),
  unknownDevices: z.boolean().nullable().optional(),
  suspiciousApps: z.boolean().nullable().optional(),
  strongPassword: z.boolean().nullable().optional(),
  backupCodesSafe: z.boolean().nullable().optional(),
});

export async function PUT(req: NextRequest) {
  const { visitorId } = await ensureVisitorSession();
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const row = await prisma.securityChecklist.upsert({
    where: { visitorSessionId: visitorId },
    create: { visitorSessionId: visitorId, ...parsed.data },
    update: { ...parsed.data },
  });

  return NextResponse.json({
    ok: true,
    source: "user_self_report",
    items: {
      twoFactorEnabled: row.twoFactorEnabled,
      emailSecure: row.emailSecure,
      phoneUpToDate: row.phoneUpToDate,
      unknownDevices: row.unknownDevices,
      suspiciousApps: row.suspiciousApps,
      strongPassword: row.strongPassword,
      backupCodesSafe: row.backupCodesSafe,
    },
  });
}
