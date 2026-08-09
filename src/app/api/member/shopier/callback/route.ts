import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { adjustBalance } from "@/lib/member";
import { pullPaymentsFromGist, pushPaymentsToGist } from "@/lib/payments-durable";
import { appBaseUrl } from "@/lib/session";
import { parseShopierCallback, verifyShopierCallback } from "@/lib/shopier";

export const dynamic = "force-dynamic";

async function handleCallback(req: NextRequest) {
  await ensureDbHydrated(true);
  await pullPaymentsFromGist();

  const base = appBaseUrl(req);
  const failUrl = `${base}/uye/bakiye?shopier=fail`;
  const okUrl = `${base}/uye/bakiye?shopier=ok`;

  let body: Record<string, unknown> = {};
  const ctype = req.headers.get("content-type") || "";
  try {
    if (ctype.includes("application/json")) {
      body = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      form.forEach((v, k) => {
        body[k] = typeof v === "string" ? v : String(v);
      });
    }
  } catch {
    return NextResponse.redirect(failUrl, 303);
  }

  const cb = parseShopierCallback(body);
  if (!cb || !verifyShopierCallback(cb)) {
    console.error("shopier_callback_invalid", body);
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

  // Idempotent: already approved
  if (request.status === "approved") {
    return NextResponse.redirect(okUrl, 303);
  }

  const claimed = await prisma.balanceRequest.updateMany({
    where: { id: request.id, status: "pending" },
    data: {
      status: "approved",
      adminNote: `Shopier payment_id=${cb.payment_id}`,
      note: `Shopier #${cb.payment_id || "ok"}`,
    },
  });

  if (claimed.count === 1) {
    await adjustBalance(
      request.memberId,
      request.amount,
      "deposit",
      `Shopier bakiye yükleme #${cb.payment_id || request.id}`,
      request.id
    );
    await pushPaymentsToGist();
  }

  return NextResponse.redirect(okUrl, 303);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

export async function GET(req: NextRequest) {
  // Some Shopier flows may GET; treat missing body as fail redirect to panel
  const base = appBaseUrl(req);
  return NextResponse.redirect(`${base}/uye/bakiye?shopier=return`, 303);
}
