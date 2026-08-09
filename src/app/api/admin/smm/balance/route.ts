import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { fetchSmmBalance, smmConfig } from "@/lib/smm/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const cfg = smmConfig();
  if (!cfg.key) {
    return NextResponse.json(
      { ok: false, error: "SMM_API_KEY tanımlı değil", configured: false },
      { status: 500 }
    );
  }

  try {
    const bal = await fetchSmmBalance();
    return NextResponse.json({
      ok: true,
      configured: true,
      url: cfg.url,
      balance: bal.balance,
      currency: bal.currency,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        url: cfg.url,
        error: e instanceof Error ? e.message : "Bakiye alınamadı",
      },
      { status: 502 }
    );
  }
}
