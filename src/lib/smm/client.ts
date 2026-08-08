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
};

const DEFAULT_URL = "https://smmapi.com/api/v2";

export function smmConfig() {
  return {
    url: (process.env.SMM_API_URL || DEFAULT_URL).replace(/\/$/, ""),
    key: process.env.SMM_API_KEY || "",
    markupPercent: Number(process.env.SMM_MARKUP_PERCENT || "50") || 50,
  };
}

export function applyMarkup(rate: number, markupPercent = 50): number {
  const sell = rate * (1 + markupPercent / 100);
  return Math.round(sell * 10000) / 10000;
}

async function smmPost(body: Record<string, string | number>) {
  const { url, key } = smmConfig();
  if (!key) {
    throw new Error("SMM_API_KEY tanımlı değil");
  }
  const form = new URLSearchParams();
  form.set("key", key);
  for (const [k, v] of Object.entries(body)) {
    form.set(k, String(v));
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`SMM API geçersiz yanıt: ${text.slice(0, 180)}`);
  }
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: string }).error));
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
  const data = (await smmPost({ action: "balance" })) as {
    balance: string;
    currency: string;
  };
  return data;
}

export async function placeSmmOrder(input: {
  service: number;
  link: string;
  quantity: number;
}): Promise<{ order: number | string }> {
  const data = (await smmPost({
    action: "add",
    service: input.service,
    link: input.link,
    quantity: input.quantity,
  })) as { order: number | string };
  return data;
}

export async function fetchSmmOrderStatus(orderId: string | number) {
  return smmPost({ action: "status", order: orderId });
}
