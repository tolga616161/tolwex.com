import { prisma } from "@/lib/db";

export type PanelSettings = {
  site_name: string;
  support_whatsapp: string;
  support_email: string;
  min_deposit: string;
  announcement: string;
  announcement_enabled: string;
  /** mono | accent */
  announcement_style: string;
  bank_name: string;
  bank_iban: string;
  bank_holder: string;
};

export const DEFAULT_SETTINGS: PanelSettings = {
  site_name: "TOLWEX",
  support_whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905338236175",
  support_email: "destek@tolwex.com",
  min_deposit: "50",
  announcement: "Hoş geldiniz — bakiye yükleyip anında sipariş verebilirsiniz.",
  announcement_enabled: "1",
  announcement_style: "mono",
  bank_name: "İş Bankası",
  bank_iban: "TR920006400000168090093279",
  bank_holder: "Tolga Mazlum",
};

export async function readPanelSettings(): Promise<PanelSettings> {
  const row = await prisma.panelSetting.findUnique({ where: { id: "main" } });
  if (!row) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.data) as Partial<PanelSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function writePanelSettings(next: PanelSettings): Promise<PanelSettings> {
  await prisma.panelSetting.upsert({
    where: { id: "main" },
    create: { id: "main", data: JSON.stringify(next) },
    update: { data: JSON.stringify(next) },
  });
  return next;
}

export function formatIban(iban: string): string {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  return clean.replace(/(.{4})/g, "$1 ").trim();
}
