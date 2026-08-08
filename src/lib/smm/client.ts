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

/**
 * Customer sell price = provider rate + markup%.
 * Default +50%. Always ceil to 2 decimals (no tiny 4–5 digit fractions).
 * Floor 0.01 so listing never shows 0,00.
 */
export function applyMarkup(rate: number, markupPercent = 50): number {
  const raw = Number(rate) || 0;
  const sell = raw * (1 + markupPercent / 100);
  const ceiled = Math.ceil((sell - Number.EPSILON) * 100) / 100;
  return Math.max(0.01, ceiled);
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
  return (await smmPost(body)) as { order: number | string };
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
