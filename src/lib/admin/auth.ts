import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function requireAdminApi() {
  const session = await getSession();
  if (!session.isAdmin) {
    return { ok: false as const, response: NextResponse.json({ error: "Yetkisiz" }, { status: 401 }) };
  }
  return { ok: true as const, session };
}
