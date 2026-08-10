/** Yeni üye hoş geldin bonusu (₺). */
export const WELCOME_BONUS_TRY = 500;

/** Havale/EFT (IBAN) admin onayı sonrası ekstra bakiye (₺). */
export const IBAN_APPROVE_BONUS_TRY = 500;

export const CAMPAIGN_ANNOUNCEMENT =
  "R10 kampanyası: Yeni üyelere 500₺ doğrulama bonusu · Havale/EFT onayında ek +500₺ bakiye hediye!";

export function normalizeTrPhone(raw: string): string | null {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return null;
  let d = digits;
  if (d.startsWith("90") && d.length >= 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  if (d.length !== 10 || !d.startsWith("5")) return null;
  return `90${d}`;
}

export function formatPhoneDisplay(e164: string): string {
  const d = e164.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("90")) {
    return `0${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  }
  return e164;
}

export function generateOtp(len = 6): string {
  let s = "";
  for (let i = 0; i < len; i++) s += String(Math.floor(Math.random() * 10));
  return s;
}

export function clientIpFromHeaders(h: Headers): string {
  const raw =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  return raw || "local";
}

export function isIgnorableIp(ip: string): boolean {
  const v = (ip || "").toLowerCase();
  return (
    !v ||
    v === "local" ||
    v === "127.0.0.1" ||
    v === "::1" ||
    v === "0.0.0.0" ||
    v.startsWith("192.168.") ||
    v.startsWith("10.")
  );
}

/** Parse order quantity — rejects letters / empty / zero with clear TR messages. */
export function parseOrderQuantity(
  raw: unknown
): { ok: true; value: number } | { ok: false; error: string } {
  if (raw === null || raw === undefined) {
    return { ok: false, error: "Adet girin" };
  }
  const t = String(raw).trim();
  if (!t) return { ok: false, error: "Adet girin" };
  if (/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(t)) {
    return { ok: false, error: "Adet yalnızca sayı olmalı — harf kullanılamaz" };
  }
  const digits = t.replace(/[.,\s]/g, "");
  if (!/^\d+$/.test(digits)) {
    return { ok: false, error: "Adet yalnızca sayı olmalı" };
  }
  const n = Math.floor(Number(digits));
  if (!Number.isFinite(n) || n < 1) {
    return { ok: false, error: n === 0 ? "Adet 0 olamaz" : "Geçerli bir adet girin" };
  }
  return { ok: true, value: n };
}
