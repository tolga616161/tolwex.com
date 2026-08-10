import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { smmConfig } from "@/lib/smm/client";
import {
  DEFAULT_SETTINGS,
  clearExpiredMaintenance,
  readPanelSettings,
  resolveMaintenance,
  writePanelSettings,
  type PanelSettings,
} from "@/lib/settings";
import { shopierConfigured, shopierWebsiteIndex } from "@/lib/shopier";
import { appBaseUrl } from "@/lib/session";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  let settings = await readPanelSettings();
  settings = await clearExpiredMaintenance(settings);
  const cfg = smmConfig();
  const base = siteUrl() || appBaseUrl();

  return NextResponse.json({
    ok: true,
    settings: {
      ...settings,
      markup_percent: cfg.markupPercent,
      smm_api_url: cfg.url,
      smm_api_configured: Boolean(cfg.key),
      shopier_configured: shopierConfigured(),
      shopier_website_index: shopierWebsiteIndex(),
      shopier_callback_url: `${base}/api/member/shopier/callback`,
    },
    maintenance: resolveMaintenance(settings),
  });
}

export async function PUT(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as Partial<PanelSettings> & {
    /** When true with enable, force-reset the 24h window from now */
    maintenance_restart?: boolean | string;
  };
  const current = await readPanelSettings();

  const hoursRaw = body.maintenance_hours ?? current.maintenance_hours;
  const hours = Math.max(1, Math.min(168, Number(hoursRaw) || 24));

  let maintenance_enabled =
    body.maintenance_enabled !== undefined
      ? String(body.maintenance_enabled)
      : current.maintenance_enabled;
  const turningOn =
    (maintenance_enabled === "1" || maintenance_enabled === "true") &&
    !(current.maintenance_enabled === "1" || current.maintenance_enabled === "true");
  const turningOff =
    (maintenance_enabled === "0" || maintenance_enabled === "false") &&
    (current.maintenance_enabled === "1" || current.maintenance_enabled === "true");
  const restart =
    body.maintenance_restart === true || body.maintenance_restart === "1";

  let maintenance_until = current.maintenance_until || "";
  if (turningOff || maintenance_enabled === "0" || maintenance_enabled === "false") {
    maintenance_enabled = "0";
    maintenance_until = "";
  } else if (turningOn || restart) {
    maintenance_enabled = "1";
    maintenance_until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  } else if (maintenance_enabled === "1" || maintenance_enabled === "true") {
    // Keep existing until unless empty
    if (!maintenance_until) {
      maintenance_until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    }
  }

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
    maintenance_enabled,
    maintenance_until,
    maintenance_hours: String(hours),
    maintenance_message:
      body.maintenance_message !== undefined
        ? String(body.maintenance_message).slice(0, 280)
        : current.maintenance_message || DEFAULT_SETTINGS.maintenance_message,
    welcome_campaign: current.welcome_campaign || "1",
  };

  await writePanelSettings(next);
  return NextResponse.json({
    ok: true,
    settings: next,
    maintenance: resolveMaintenance(next),
  });
}
