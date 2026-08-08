import { NextRequest, NextResponse } from "next/server";
import { syncOpenOrderStatuses } from "@/lib/smm/sync-status";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
  const expected = process.env.CRON_SECRET || process.env.ADMIN_PASSWORD || "";
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const result = await syncOpenOrderStatuses(100);
    await writeAuditLog({
      action: "cron.sync_orders",
      actorType: "system",
      metadata: result,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}
