import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { ensureDbHydrated } from "@/lib/db";

const schema = z.object({
  /** username or email — smmapi style login */
  login: z.string().min(1).max(160),
  password: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  await ensureDbHydrated(true);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`login:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  // backward compatible: email field
  const raw = json && typeof json === "object" ? json as Record<string, unknown> : {};
  const loginVal = String(raw.login || raw.email || "").trim();
  const parsed = schema.safeParse({ login: loginVal, password: raw.password });
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz giriş" }, { status: 400 });
  }

  const key = parsed.data.login.toLowerCase();
  const member = await prisma.member.findFirst({
    where: {
      OR: [{ email: key }, { username: key }],
      active: true,
    },
  });
  if (!member || !verifyPassword(parsed.data.password, member.passwordHash)) {
    return NextResponse.json({ error: "Kullanıcı adı/e-posta veya şifre hatalı" }, { status: 401 });
  }

  const session = await getSession();
  session.memberId = member.id;
  session.memberEmail = member.email;
  await session.save();

  await writeAuditLog({
    action: "member.login",
    actorType: "visitor",
    actorId: member.id,
  });

  return NextResponse.json({
    ok: true,
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      username: member.username,
    },
  });
}

export async function DELETE() {
  const session = await getSession();
  session.memberId = undefined;
  session.memberEmail = undefined;
  await session.save();
  return NextResponse.json({ ok: true });
}
