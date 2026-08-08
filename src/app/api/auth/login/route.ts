import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`login:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz giriş" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const member = await prisma.member.findUnique({ where: { email } });
  if (!member || !member.active || !verifyPassword(parsed.data.password, member.passwordHash)) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
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
    member: { id: member.id, email: member.email, name: member.name },
  });
}

export async function DELETE() {
  const session = await getSession();
  session.memberId = undefined;
  session.memberEmail = undefined;
  await session.save();
  return NextResponse.json({ ok: true });
}
