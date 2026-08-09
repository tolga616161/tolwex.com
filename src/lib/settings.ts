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
  /** "0" | "1" */
  maintenance_enabled: string;
  /** ISO end time while maintenance is on */
  maintenance_until: string;
  /** hours when enabling (default 24) */
  maintenance_hours: string;
  maintenance_message: string;
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
  maintenance_enabled: "0",
  maintenance_until: "",
  maintenance_hours: "24",
  maintenance_message: "Kısa bir bakımdayız. Çok yakında döneceğiz.",
};

export type MaintenancePublic = {
  active: boolean;
  until: string | null;
  remainingMs: number;
  hours: number;
  message: string;
};

export function resolveMaintenance(s: PanelSettings): MaintenancePublic {
  const hours = Math.max(1, Math.min(168, Number(s.maintenance_hours) || 24));
  const enabled = s.maintenance_enabled === "1" || s.maintenance_enabled === "true";
  const untilMs = s.maintenance_until ? Date.parse(s.maintenance_until) : NaN;
  const message =
    (s.maintenance_message || "").trim() || DEFAULT_SETTINGS.maintenance_message;

  if (!enabled || !Number.isFinite(untilMs)) {
    return { active: false, until: null, remainingMs: 0, hours, message };
  }

  const remainingMs = untilMs - Date.now();
  if (remainingMs <= 0) {
    return { active: false, until: null, remainingMs: 0, hours, message };
  }

  return {
    active: true,
    until: new Date(untilMs).toISOString(),
    remainingMs,
    hours,
    message,
  };
}

/** If maintenance expired, clear flags in DB (best-effort). */
export async function clearExpiredMaintenance(s: PanelSettings): Promise<PanelSettings> {
  const enabled = s.maintenance_enabled === "1" || s.maintenance_enabled === "true";
  if (!enabled || !s.maintenance_until) return s;
  const untilMs = Date.parse(s.maintenance_until);
  if (!Number.isFinite(untilMs) || untilMs > Date.now()) return s;

  const next: PanelSettings = {
    ...s,
    maintenance_enabled: "0",
    maintenance_until: "",
  };
  await writePanelSettings(next);
  return next;
}

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
