export type SmmRawService = {
  service: number;
  name: string;
  type?: string;
  category?: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  dripfeed?: boolean;
  refill?: boolean;
  cancel?: boolean;
  desc?: string;
  description?: string;
  service_description?: string;
};

/** Best-effort description from provider payload + useful flags. */
export function serviceDescriptionFromRaw(s: SmmRawService): string {
  const raw =
    s.description ||
    s.desc ||
    s.service_description ||
    "";
  const flags = [
    s.refill ? "Refill var" : "",
    s.cancel ? "İptal edilebilir" : "",
    s.dripfeed ? "Drip-feed destekli" : "",
    s.type && s.type !== "Default" ? `Tip: ${s.type}` : "",
  ].filter(Boolean);
  const parts = [String(raw || "").trim(), flags.join(" · ")].filter(Boolean);
  return parts.join(" — ").slice(0, 2000);
}

const DEFAULT_URL = "https://smmapi.com/api/v2";

export function smmConfig() {
  return {
    url: (process.env.SMM_API_URL || DEFAULT_URL).replace(/\/$/, ""),
    key: process.env.SMM_API_KEY || "",
    markupPercent: Number(process.env.SMM_MARKUP_PERCENT || "100") || 100,
  };
}

/**
 * Customer sell price = provider rate + markup%.
 * Default +100% (2× cost) on normal rates.
 * Ultra-cheap / fractional rates get a lighter commission so 2-decimal
 * rounding doesn't inflate tiny prices too much.
 * Floor 0.01 so listing never shows 0,00.
 */
export function applyMarkup(rate: number, markupPercent = 100): number {
  const raw = Number(rate) || 0;
  if (raw <= 0) return 0.01;

  // Soften commission on very low provider rates (küsürat)
  let pct = markupPercent;
  if (raw < 0.2) pct = Math.min(markupPercent, 25);
  else if (raw < 0.5) pct = Math.min(markupPercent, 40);
  else if (raw < 1) pct = Math.min(markupPercent, 55);

  const sell = raw * (1 + pct / 100);
  const rounded =
    raw < 1
      ? Math.round(sell * 100) / 100
      : Math.ceil((sell - Number.EPSILON) * 100) / 100;
  return Math.max(0.01, rounded);
}

async function smmPost(body: Record<string, string | number>) {
  const { url, key } = smmConfig();
  if (!key) {
    throw new Error("SMM_API_KEY tanımlı değil — Vercel ortam değişkenini kontrol et");
  }
  const form = new URLSearchParams();
  form.set("key", key);
  for (const [k, v] of Object.entries(body)) {
    form.set(k, String(v));
  }
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });
  } catch (e) {
    throw new Error(
      `SMM API’ye bağlanılamadı: ${e instanceof Error ? e.message : "ağ hatası"}`
    );
  }
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`SMM API geçersiz yanıt (HTTP ${res.status}): ${text.slice(0, 180)}`);
  }
  if (data && typeof data === "object" && "error" in data) {
    const raw = String((data as { error: string }).error || "unknown");
    // Keep provider text but make common cases clearer in TR
    if (/invalid api key/i.test(raw)) throw new Error("SMM API anahtarı geçersiz");
    if (/not enough funds|insufficient/i.test(raw)) {
      throw new Error("Sistem bakiyesi sipariş için yetersiz. Destek ile iletişime geçin.");
    }
    if (/incorrect|invalid.*(link|order|service)/i.test(raw)) {
      throw new Error(`Sipariş reddedildi: ${raw}`);
    }
    throw new Error(raw);
  }
  return data;
}

export async function fetchSmmServices(): Promise<SmmRawService[]> {
  const data = await smmPost({ action: "services" });
  if (!Array.isArray(data)) {
    throw new Error("SMM services listesi beklenen formatta değil");
  }
  return data as SmmRawService[];
}

export async function fetchSmmBalance(): Promise<{ balance: string; currency: string }> {
  return (await smmPost({ action: "balance" })) as {
    balance: string;
    currency: string;
  };
}

export type PlaceOrderInput = {
  service: number;
  link: string;
  quantity: number;
  comments?: string;
  runs?: number;
  interval?: number;
};

export async function placeSmmOrder(input: PlaceOrderInput): Promise<{ order: number | string }> {
  const body: Record<string, string | number> = {
    action: "add",
    service: input.service,
    link: input.link,
    quantity: input.quantity,
  };
  if (input.comments) body.comments = input.comments;
  if (input.runs && input.interval) {
    body.runs = input.runs;
    body.interval = input.interval;
  }
  const data = (await smmPost(body)) as { order?: number | string };
  if (data?.order === undefined || data?.order === null || data?.order === "") {
    throw new Error("SMM API sipariş ID dönmedi — tekrar dene");
  }
  return { order: data.order };
}

export async function fetchSmmOrderStatus(orderId: string | number) {
  return smmPost({ action: "status", order: orderId });
}

export async function fetchSmmMultiStatus(orderIds: Array<string | number>) {
  return smmPost({
    action: "status",
    orders: orderIds.join(","),
  }) as Promise<Record<string, {
    status?: string;
    charge?: string | number;
    start_count?: string | number;
    remains?: string | number;
    currency?: string;
  }>>;
}

export async function requestSmmRefill(orderId: string | number) {
  return smmPost({ action: "refill", order: orderId });
}
