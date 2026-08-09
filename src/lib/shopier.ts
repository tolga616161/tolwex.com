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

function currencyCode(currency: string): number {
  const map: Record<string, number> = { TRY: 0, TL: 0, USD: 1, EUR: 2 };
  return map[currency.toUpperCase()] ?? 0;
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

  const total = Number(opts.amount).toFixed(2);
  const currency = currencyCode("TRY");
  const randomNr = String(randomInt(100000, 999999));
  const platformOrderId = opts.orderId;

  const data = `${randomNr}${platformOrderId}${total}${currency}`;
  const signature = createHmac("sha256", apiSecret).update(data).digest("base64");

  const phone = (opts.buyer.phone || "05000000000").replace(/\D/g, "").slice(-11) || "05000000000";

  const fields: ShopierPaymentFields = {
    API_key: apiKey,
    website_index: opts.websiteIndex ?? 1,
    platform_order_id: platformOrderId,
    product_name: opts.productName.slice(0, 120),
    product_type: 1, // digital
    buyer_name: opts.buyer.firstName.slice(0, 50) || "Tolwex",
    buyer_surname: opts.buyer.lastName.slice(0, 50) || "Uye",
    buyer_email: opts.buyer.email,
    buyer_account_age: 0,
    buyer_id_nr: opts.buyer.id.slice(0, 40),
    buyer_phone: phone,
    billing_address: "Online",
    billing_city: "Istanbul",
    billing_country: "Turkey",
    billing_postcode: "34000",
    shipping_address: "Online",
    shipping_city: "Istanbul",
    shipping_country: "Turkey",
    shipping_postcode: "34000",
    total_order_value: total,
    currency,
    platform: 0,
    is_in_frame: 0,
    current_language: 0,
    modul_version: "1.0.4",
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

/** Verify Shopier callback HMAC (supports both common payload variants). */
export function verifyShopierCallback(cb: ShopierCallback): boolean {
  const apiSecret = process.env.SHOPIER_API_SECRET?.trim();
  if (!apiSecret) return false;

  const expectedSig = Buffer.from(cb.signature, "base64");
  if (!expectedSig.length) return false;

  const candidates: string[] = [];
  if (cb.total_order_value != null && cb.currency != null) {
    candidates.push(`${cb.random_nr}${cb.platform_order_id}${cb.total_order_value}${cb.currency}`);
  }
  candidates.push(`${cb.random_nr}${cb.platform_order_id}`);

  for (const data of candidates) {
    const computed = createHmac("sha256", apiSecret).update(data).digest();
    if (
      computed.length === expectedSig.length &&
      timingSafeEqual(computed, expectedSig)
    ) {
      return true;
    }
  }
  return false;
}

export function splitBuyerName(name: string, fallback: string): { firstName: string; lastName: string } {
  const raw = (name || fallback || "Tolwex Uye").trim().replace(/\s+/g, " ");
  const parts = raw.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "Uye" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
