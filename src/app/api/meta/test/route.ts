import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { testMetaAppConnection } from "@/lib/meta/api";
import { writeAuditLog } from "@/lib/audit";

async function assertAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    return false;
  }
  return true;
}

export async function POST() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const result = await testMetaAppConnection();
  await writeAuditLog({
    action: "admin.connection_test",
    actorType: "admin",
    metadata: { ok: result.ok },
  });

  return NextResponse.json({
    ok: result.ok,
    message: result.ok
      ? "Meta API bağlantısı çalışıyor."
      : result.message || "Meta API bağlantısı başarısız.",
  });
}
