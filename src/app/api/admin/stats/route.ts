import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { getAdminDashboardStats } from "@/lib/admin/stats";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const stats = await getAdminDashboardStats();
  return NextResponse.json(stats);
}
