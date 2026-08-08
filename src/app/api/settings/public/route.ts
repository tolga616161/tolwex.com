import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  DEFAULT_SETTINGS,
  formatIban,
  readPanelSettings,
  writePanelSettings,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  let s = await readPanelSettings();
  const row = await prisma.panelSetting.findUnique({ where: { id: "main" } });
  if (!row) {
    s = await writePanelSettings({ ...DEFAULT_SETTINGS });
  }
  return NextResponse.json({
    ok: true,
    site_name: s.site_name,
    announcement: s.announcement,
    announcement_enabled: s.announcement_enabled === "1" || s.announcement_enabled === "true",
    min_deposit: Number(s.min_deposit) || 50,
    support_whatsapp: s.support_whatsapp,
    bank: {
      name: s.bank_name,
      iban: s.bank_iban,
      iban_formatted: formatIban(s.bank_iban),
      holder: s.bank_holder,
    },
  });
}
