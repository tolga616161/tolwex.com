import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { adjustBalance } from "@/lib/member";
import { pullPaymentsFromGist, pushPaymentsToGist } from "@/lib/payments-durable";
import { appBaseUrl } from "@/lib/session";
import {
  amountsMatch,
  parseShopierCallback,
  verifyShopierCallback,
} from "@/lib/shopier";

export const dynamic = "force-dynamic";

async function readBody(req: NextRequest): Promise<Record<string, unknown>> {
  const ctype = req.headers.get("content-type") || "";
  const body: Record<string, unknown> = {};

  if (ctype.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (json && typeof json === "object") Object.assign(body, json);
  } else if (ctype.includes("form") || req.method === "POST") {
    try {
      const form = await req.formData();
      form.forEach((v, k) => {
        body[k] = typeof v === "string" ? v : String(v);
      });
    } catch {
      /* empty */
    }
  }

  // Also merge query (some return flows use GET)
  const url = new URL(req.url);
  url.searchParams.forEach((v, k) => {
    if (!(k in body)) body[k] = v;
  });

  return body;
}

async function handleCallback(req: NextRequest) {
  await ensureDbHydrated(true);
  await pullPaymentsFromGist().catch(() => null);

  const base = appBaseUrl(req);
  const failUrl = `${base}/uye/bakiye?pay=fail`;
  const okUrl = `${base}/uye/bakiye?pay=ok`;

  let body: Record<string, unknown>;
  try {
    body = await readBody(req);
  } catch {
    return NextResponse.redirect(failUrl, 303);
  }

  const cb = parseShopierCallback(body);
  if (!cb || !verifyShopierCallback(cb)) {
    console.error("shopier_callback_invalid", {
      keys: Object.keys(body),
      status: body.status,
      order: body.platform_order_id,
    });
    return NextResponse.redirect(failUrl, 303);
  }

  if (cb.status !== "success") {
    await prisma.balanceRequest
      .updateMany({
        where: { id: cb.platform_order_id, method: "shopier", status: "pending" },
        data: {
          status: "rejected",
          adminNote: `Shopier status=${cb.status}`,
        },
      })
      .catch(() => null);
    await pushPaymentsToGist().catch(() => null);
    return NextResponse.redirect(failUrl, 303);
  }

  const request = await prisma.balanceRequest.findUnique({
    where: { id: cb.platform_order_id },
  });
  if (!request || request.method !== "shopier") {
    return NextResponse.redirect(failUrl, 303);
  }

  if (!amountsMatch(request.amount, cb.total_order_value)) {
    console.error("shopier_amount_mismatch", {
      expected: request.amount,
      got: cb.total_order_value,
      id: request.id,
    });
    return NextResponse.redirect(failUrl, 303);
  }

  if (request.status === "approved") {
    return NextResponse.redirect(okUrl, 303);
  }

  const claimed = await prisma.balanceRequest.updateMany({
    where: { id: request.id, status: "pending" },
    data: {
      status: "approved",
      adminNote: `Shopier payment_id=${cb.payment_id}`,
      note: `Kart ödeme #${cb.payment_id || "ok"}`,
    },
  });

  if (claimed.count === 1) {
    await adjustBalance(
      request.memberId,
      request.amount,
      "deposit",
      `Kart ile bakiye yükleme #${cb.payment_id || request.id}`,
      request.id
    );
    await pushPaymentsToGist().catch(() => null);
  }

  return NextResponse.redirect(okUrl, 303);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("platform_order_id") && url.searchParams.get("signature")) {
    return handleCallback(req);
  }
  const base = appBaseUrl(req);
  return NextResponse.redirect(`${base}/uye/bakiye?pay=return`, 303);
}
