import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getProductionChecklist } from "@/lib/meta/production-checklist";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const checks = await getProductionChecklist();
  const ready = checks.every((c) => c.ok);
  return NextResponse.json({ ready, checks });
}
