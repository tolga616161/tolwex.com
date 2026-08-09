import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { smmConfig } from "@/lib/smm/client";
import {
  DEFAULT_SETTINGS,
  readPanelSettings,
  writePanelSettings,
  type PanelSettings,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const settings = await readPanelSettings();
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

  const body = (await request.json().catch(() => ({}))) as Partial<PanelSettings>;
  const current = await readPanelSettings();
  const next: PanelSettings = {
    site_name: body.site_name?.trim() || current.site_name,
    support_whatsapp: body.support_whatsapp?.trim() || current.support_whatsapp,
    support_email: body.support_email?.trim() || current.support_email,
    min_deposit: body.min_deposit?.trim() || current.min_deposit,
    announcement:
      body.announcement !== undefined ? String(body.announcement) : current.announcement,
    announcement_enabled:
      body.announcement_enabled !== undefined
        ? String(body.announcement_enabled)
        : current.announcement_enabled,
    announcement_style:
      body.announcement_style === "accent" || body.announcement_style === "mono"
        ? body.announcement_style
        : current.announcement_style || DEFAULT_SETTINGS.announcement_style,
    bank_name: body.bank_name?.trim() || current.bank_name || DEFAULT_SETTINGS.bank_name,
    bank_iban: (body.bank_iban?.trim() || current.bank_iban || DEFAULT_SETTINGS.bank_iban)
      .replace(/\s+/g, "")
      .toUpperCase(),
    bank_holder: body.bank_holder?.trim() || current.bank_holder || DEFAULT_SETTINGS.bank_holder,
  };

  await writePanelSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
