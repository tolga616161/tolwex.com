import { createHmac, timingSafeEqual, randomInt } from "crypto";

export const SHOPIER_PAYMENT_URL = "https://www.shopier.com/ShowProduct/api_pay4.php";

export type ShopierBuyer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ShopierPaymentFields = Record<string, string | number>;

export function shopierConfigured(): boolean {
  return Boolean(process.env.SHOPIER_API_KEY?.trim() && process.env.SHOPIER_API_SECRET?.trim());
}

export function shopierWebsiteIndex(): number {
  const n = Number(process.env.SHOPIER_WEBSITE_INDEX || "1");
  if (!Number.isFinite(n) || n < 1 || n > 5) return 1;
  return Math.floor(n);
}

function currencyCode(currency: string): number {
  const map: Record<string, number> = { TRY: 0, TL: 0, USD: 1, EUR: 2 };
  return map[currency.toUpperCase()] ?? 0;
}

/** Shopier expects a TR mobile like 05xxxxxxxxx */
export function shopierPhone(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "05000000000";
  let d = digits;
  if (d.startsWith("90") && d.length >= 12) d = d.slice(2);
  if (d.length === 10 && d.startsWith("5")) return `0${d}`;
  if (d.length === 11 && d.startsWith("05")) return d;
  return d.slice(-11).padStart(11, "0");
}

/** Build signed Shopier checkout form fields. */
export function buildShopierPayment(opts: {
  orderId: string;
  amount: number;
  productName: string;
  callbackUrl: string;
  buyer: ShopierBuyer;
  websiteIndex?: number;
}): { action: string; fields: ShopierPaymentFields } {
  const apiKey = process.env.SHOPIER_API_KEY?.trim();
  const apiSecret = process.env.SHOPIER_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    throw new Error("Shopier API anahtarları eksik");
  }

  const total = (Math.round(Number(opts.amount) * 100) / 100).toFixed(2);
  const currency = currencyCode("TRY");
  const randomNr = String(randomInt(100000, 999999));
  const platformOrderId = opts.orderId;

  const data = `${randomNr}${platformOrderId}${total}${currency}`;
  const signature = createHmac("sha256", apiSecret).update(data).digest("base64");

  const phone = shopierPhone(opts.buyer.phone);
  const city = (process.env.SHOPIER_BILLING_CITY || "Istanbul").slice(0, 40);
  const address = (process.env.SHOPIER_BILLING_ADDRESS || "Dijital hizmet - online teslimat").slice(
    0,
    120
  );

  const fields: ShopierPaymentFields = {
    API_key: apiKey,
    website_index: opts.websiteIndex ?? shopierWebsiteIndex(),
    platform_order_id: platformOrderId,
    product_name: opts.productName.slice(0, 120),
    product_type: 1, // digital / virtual
    buyer_name: opts.buyer.firstName.slice(0, 50) || "Tolwex",
    buyer_surname: opts.buyer.lastName.slice(0, 50) || "Uye",
    buyer_email: opts.buyer.email,
    buyer_account_age: 0,
    buyer_id_nr: opts.buyer.id.slice(0, 40),
    buyer_phone: phone,
    billing_address: address,
    billing_city: city,
    billing_country: "Turkey",
    billing_postcode: process.env.SHOPIER_BILLING_POSTCODE || "34000",
    shipping_address: address,
    shipping_city: city,
    shipping_country: "Turkey",
    shipping_postcode: process.env.SHOPIER_BILLING_POSTCODE || "34000",
    total_order_value: total,
    currency,
    platform: 0,
    is_in_frame: 0,
    current_language: 0,
    modul_version: "1.0.5",
    random_nr: randomNr,
    signature,
    callback: opts.callbackUrl,
  };

  return { action: SHOPIER_PAYMENT_URL, fields };
}

export type ShopierCallback = {
  status: string;
  platform_order_id: string;
  payment_id: string;
  installment: string;
  random_nr: string;
  signature: string;
  total_order_value?: string;
  currency?: string;
  API_key?: string;
};

export function parseShopierCallback(body: Record<string, unknown>): ShopierCallback | null {
  const platform_order_id = String(body.platform_order_id || "").trim();
  const signature = String(body.signature || "").trim();
  const random_nr = String(body.random_nr || "").trim();
  if (!platform_order_id || !signature || !random_nr) return null;
  return {
    status: String(body.status || "").toLowerCase(),
    platform_order_id,
    payment_id: String(body.payment_id || ""),
    installment: String(body.installment || "0"),
    random_nr,
    signature,
    total_order_value: body.total_order_value != null ? String(body.total_order_value) : undefined,
    currency: body.currency != null ? String(body.currency) : undefined,
    API_key: body.API_key != null ? String(body.API_key) : undefined,
  };
}

/** Verify Shopier callback HMAC (request + response payload variants). */
export function verifyShopierCallback(cb: ShopierCallback): boolean {
  const apiSecret = process.env.SHOPIER_API_SECRET?.trim();
  if (!apiSecret) return false;

  let expectedSig: Buffer;
  try {
    expectedSig = Buffer.from(cb.signature, "base64");
  } catch {
    return false;
  }
  if (!expectedSig.length) return false;

  const candidates: string[] = [
    `${cb.random_nr}${cb.platform_order_id}`,
  ];
  if (cb.total_order_value != null && cb.currency != null) {
    candidates.unshift(
      `${cb.random_nr}${cb.platform_order_id}${cb.total_order_value}${cb.currency}`
    );
  }

  for (const data of candidates) {
    const computed = createHmac("sha256", apiSecret).update(data).digest();
    if (computed.length === expectedSig.length && timingSafeEqual(computed, expectedSig)) {
      return true;
    }
  }
  return false;
}

export function splitBuyerName(
  name: string,
  fallback: string
): { firstName: string; lastName: string } {
  const raw = (name || fallback || "Tolwex Uye").trim().replace(/\s+/g, " ");
  const parts = raw.split(" ").filter(Boolean);
  if (parts.length === 0) return { firstName: "Tolwex", lastName: "Uye" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "Uye" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function amountsMatch(expected: number, reported?: string): boolean {
  if (reported == null || reported === "") return true;
  const a = Math.round(expected * 100);
  const b = Math.round(Number(String(reported).replace(",", ".")) * 100);
  if (!Number.isFinite(b)) return true;
  return a === b;
}
