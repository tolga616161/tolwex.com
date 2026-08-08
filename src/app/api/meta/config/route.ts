import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getMetaPublicStatus, upsertMetaConfig } from "@/lib/meta/config";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getSession();
  return Boolean(session.isAdmin);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const status = await getMetaPublicStatus();
  const { getMetaConfig } = await import("@/lib/meta/config");
  const config = await getMetaConfig();
  // App Secret asla dönülmez. Webhook verify token yalnızca admin’e gösterilir (Meta Console’a yapıştırmak için).
  return NextResponse.json({
    ...status,
    webhookVerifyToken: config.webhookVerifyToken || null,
  });
}

const bodySchema = z.object({
  appId: z.string().min(1),
  appSecret: z.string().optional(),
  redirectUri: z.string().url(),
  domain: z.string().min(1),
  apiVersion: z.string().default("v21.0"),
  webhookVerifyToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz yapılandırma" }, { status: 400 });
  }

  const existing = await prisma.metaConfig.findFirst();
  if (!parsed.data.appSecret && !existing?.encryptedAppSecret && !process.env.META_APP_SECRET) {
    return NextResponse.json(
      { error: "Meta App Secret gerekli (ilk kurulum)." },
      { status: 400 }
    );
  }

  await upsertMetaConfig(parsed.data);
  await writeAuditLog({
    action: "admin.meta_config_saved",
    actorType: "admin",
    metadata: {
      appIdConfigured: true,
      redirectUri: parsed.data.redirectUri,
      apiVersion: parsed.data.apiVersion,
      secretUpdated: Boolean(parsed.data.appSecret),
    },
  });

  const status = await getMetaPublicStatus();
  return NextResponse.json({ ok: true, status });
}
