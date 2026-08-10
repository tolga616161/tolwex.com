import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { upsertMemberInGist } from "@/lib/members-durable";
import { sendOtpEmail } from "@/lib/mail";
import {
  clientIpFromHeaders,
  generateOtp,
} from "@/lib/welcome-bonus";

const verifySchema = z.object({
  emailOtp: z.string().min(4).max(8),
  phoneOtp: z.string().min(4).max(8),
});

export async function GET() {
  await ensureDbHydrated(true);
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ member: null, needsVerify: false });
  }
  const member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
    select: {
      id: true,
      email: true,
      username: true,
      phone: true,
      emailVerified: true,
      phoneVerified: true,
      otpExpiresAt: true,
    },
  });
  if (!member) return NextResponse.json({ member: null, needsVerify: false });
  const needsVerify = !member.emailVerified || !member.phoneVerified;
  return NextResponse.json({
    member: {
      id: member.id,
      email: member.email,
      username: member.username,
      phone: member.phone,
    },
    needsVerify,
    welcomeBonus: 0,
    expired: member.otpExpiresAt ? member.otpExpiresAt.getTime() < Date.now() : false,
  });
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbHydrated(true);
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(`verify:${ip}`, 15, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Çok fazla deneme" }, { status: 429 });
    }

    const session = await getSession();
    if (!session.memberId) {
      return NextResponse.json({ error: "Önce kayıt olun / giriş yapın" }, { status: 401 });
    }

    const parsed = verifySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Kodları girin" }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: { id: session.memberId, active: true },
    });
    if (!member) {
      return NextResponse.json({ error: "Üye bulunamadı" }, { status: 404 });
    }

    if (member.emailVerified && member.phoneVerified) {
      return NextResponse.json({
        ok: true,
        alreadyVerified: true,
        welcomeBonus: 0,
      });
    }

    if (member.otpExpiresAt && member.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Kodların süresi doldu — yeni kod isteyin" },
        { status: 400 }
      );
    }

    const emailOk = String(parsed.data.emailOtp).trim() === member.emailOtp;
    const phoneOk = String(parsed.data.phoneOtp).trim() === member.phoneOtp;
    if (!emailOk || !phoneOk) {
      return NextResponse.json(
        { error: "Doğrulama kodları hatalı — e-posta ve telefon kodlarını kontrol edin" },
        { status: 400 }
      );
    }

    await prisma.member.update({
      where: { id: member.id },
      data: {
        emailVerified: true,
        phoneVerified: true,
        emailOtp: "",
        phoneOtp: "",
        otpExpiresAt: null,
      },
    });

    // Kayıt/doğrulamada bakiye YOK — bonus sadece IBAN 500₺+ yatırınca

    const fresh = await prisma.member.findUnique({ where: { id: member.id } });
    if (fresh) await upsertMemberInGist(fresh);

    await writeAuditLog({
      action: "member.verify",
      actorType: "visitor",
      actorId: member.id,
      metadata: { welcomeBonus: 0 },
    });

    return NextResponse.json({
      ok: true,
      credited: false,
      welcomeBonus: 0,
      balance: fresh?.balance ?? member.balance,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Doğrulama hatası";
    console.error("verify_failed", message);
    return NextResponse.json({ error: "Doğrulama başarısız", detail: message }, { status: 500 });
  }
}

/** Resend OTP codes */
export async function PUT(req: NextRequest) {
  await ensureDbHydrated(true);
  const ip = clientIpFromHeaders(req.headers);
  const rl = rateLimit(`verify-resend:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
  }

  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
  });
  if (!member) return NextResponse.json({ error: "Üye yok" }, { status: 404 });
  if (member.emailVerified && member.phoneVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const emailOtp = generateOtp(6);
  const phoneOtp = generateOtp(6);
  const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.member.update({
    where: { id: member.id },
    data: { emailOtp, phoneOtp, otpExpiresAt },
  });

  const mail = await sendOtpEmail({
    to: member.email,
    subject: "TOLWEX — yeni doğrulama kodları",
    text: `E-posta kodu: ${emailOtp}\nTelefon kodu: ${phoneOtp}\n30 dk geçerli.`,
  });

  void req;
  return NextResponse.json({
    ok: true,
    mailDelivered: mail.delivered,
    ...(mail.delivered ? {} : { emailOtp, phoneOtp }),
  });
}
