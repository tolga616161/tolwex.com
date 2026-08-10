import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { pullMembersFromGist } from "@/lib/members-durable";
import { clientIpFromHeaders } from "@/lib/welcome-bonus";

const schema = z.object({
  login: z.string().min(1).max(160),
  password: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    await ensureDbHydrated(true);

    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(`login:${ip}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const raw = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
    const loginVal = String(raw.login || raw.email || "").trim();
    const parsed = schema.safeParse({ login: loginVal, password: raw.password });
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz giriş" }, { status: 400 });
    }

    const key = parsed.data.login.toLowerCase();
    let member = await prisma.member.findFirst({
      where: {
        OR: [{ email: key }, { username: key }],
        active: true,
      },
    });

    // Cold instance: member may only exist in gist
    if (!member) {
      await pullMembersFromGist({ force: true });
      member = await prisma.member.findFirst({
        where: {
          OR: [{ email: key }, { username: key }],
          active: true,
        },
      });
    }

    if (!member || !verifyPassword(parsed.data.password, member.passwordHash)) {
      return NextResponse.json(
        { error: "Kullanıcı adı/e-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    // Eski OTP hesaplarını aç
    if (!member.emailVerified || !member.phoneVerified) {
      member = await prisma.member.update({
        where: { id: member.id },
        data: { emailVerified: true, phoneVerified: true, emailOtp: "", phoneOtp: "" },
      });
    }

    const session = await getSession();
    session.memberId = member.id;
    session.memberEmail = member.email;
    await session.save();

    await writeAuditLog({
      action: "member.login",
      actorType: "visitor",
      actorId: member.id,
      metadata: { needsVerify: false },
    });

    return NextResponse.json({
      ok: true,
      needsVerify: false,
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        username: member.username,
        balance: member.balance,
        phone: member.phone,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Giriş hatası";
    console.error("login_failed", message);
    return NextResponse.json(
      { error: "Giriş şu an yapılamıyor. Lütfen tekrar deneyin.", detail: message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getSession();
  session.memberId = undefined;
  session.memberEmail = undefined;
  await session.save();
  return NextResponse.json({ ok: true });
}
