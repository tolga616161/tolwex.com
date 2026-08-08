import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSession } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";

function safeCompare(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    // Dev convenience: allow admin when ADMIN_PASSWORD unset (local only)
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Admin şifresi yapılandırılmamış." },
        { status: 503 }
      );
    }
  } else if (!safeCompare(password, expected)) {
    await writeAuditLog({
      action: "admin.login_failed",
      actorType: "admin",
    });
    return NextResponse.json({ error: "Geçersiz şifre" }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  await writeAuditLog({ action: "admin.login", actorType: "admin" });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getSession();
  session.isAdmin = false;
  await session.save();
  return NextResponse.json({ ok: true });
}
