import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { smmConfig } from "@/lib/smm/client";

export const dynamic = "force-dynamic";

type SettingsData = {
  site_name: string;
  support_whatsapp: string;
  support_email: string;
  min_deposit: string;
  announcement: string;
};

const DEFAULTS: SettingsData = {
  site_name: "TOLWEX",
  support_whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905338236175",
  support_email: "destek@tolwex.com",
  min_deposit: "50",
  announcement: "",
};

async function readSettings(): Promise<SettingsData> {
  const row = await prisma.panelSetting.findUnique({ where: { id: "main" } });
  if (!row) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...(JSON.parse(row.data) as Partial<SettingsData>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const settings = await readSettings();
  const cfg = smmConfig();

  return NextResponse.json({
    ok: true,
    settings: {
      ...settings,
      markup_percent: cfg.markupPercent,
      smm_api_url: cfg.url,
      smm_api_configured: Boolean(cfg.key),
    },
  });
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as Partial<SettingsData>;
  const current = await readSettings();
  const next: SettingsData = {
    site_name: body.site_name?.trim() || current.site_name,
    support_whatsapp: body.support_whatsapp?.trim() || current.support_whatsapp,
    support_email: body.support_email?.trim() || current.support_email,
    min_deposit: body.min_deposit?.trim() || current.min_deposit,
    announcement: body.announcement !== undefined ? String(body.announcement) : current.announcement,
  };

  await prisma.panelSetting.upsert({
    where: { id: "main" },
    create: { id: "main", data: JSON.stringify(next) },
    update: { data: JSON.stringify(next) },
  });

  return NextResponse.json({ ok: true, settings: next });
}
