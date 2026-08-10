import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { generateApiKey } from "@/lib/api-key";
import { upsertMemberInGist, pushMembersToGist } from "@/lib/members-durable";
import { sendOtpEmail } from "@/lib/mail";
import {
  clientIpFromHeaders,
  generateOtp,
  isIgnorableIp,
  normalizeTrPhone,
  WELCOME_BONUS_TRY,
} from "@/lib/welcome-bonus";

const schema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Kullanıcı adı yalnızca harf, rakam, . _ -"),
    email: z.string().email("Geçerli bir e-posta girin").max(160),
    name: z
      .union([z.string().min(2).max(80), z.literal("")])
      .optional()
      .transform((v) => (v && v.trim() ? v.trim() : undefined)),
    phone: z.string().min(10, "Telefon zorunlu").max(40),
    password: z.string().min(6, "Şifre en az 6 karakter").max(100),
    passwordAgain: z.string().min(6).max(100),
  })
  .refine((d) => d.password === d.passwordAgain, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordAgain"],
  });

export async function POST(req: NextRequest) {
  try {
    await ensureDbHydrated(true);

    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(`reg:${ip}`, 8, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Çok fazla istek — biraz bekleyin" }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Geçersiz form";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const username = parsed.data.username.trim().toLowerCase();
    const email = parsed.data.email.trim().toLowerCase();
    const phone = normalizeTrPhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json(
        {
          error:
            "Geçerli bir Türkiye cep telefonu girin (05xx…). Bonus için telefon zorunlu.",
        },
        { status: 400 }
      );
    }

    if (!isIgnorableIp(ip)) {
      const ipHit = await prisma.member.findFirst({
        where: { registerIp: ip },
        select: { id: true },
      });
      if (ipHit) {
        return NextResponse.json(
          {
            error:
              "Bu IP adresinden daha önce üyelik açılmış. Kampanya tek hesap / tek IP — yeni bonus verilemez.",
          },
          { status: 409 }
        );
      }
    }

    const existsUser = await prisma.member.findFirst({
      where: { OR: [{ email }, { username }, { phone }] },
      select: { id: true, email: true, username: true, phone: true },
    });
    if (existsUser) {
      if (existsUser.phone === phone) {
        return NextResponse.json(
          { error: "Bu telefon numarası zaten kayıtlı" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Bu kullanıcı adı veya e-posta zaten kayıtlı" },
        { status: 409 }
      );
    }

    const emailOtp = generateOtp(6);
    const phoneOtp = generateOtp(6);
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const member = await prisma.member.create({
      data: {
        username,
        email,
        name: (parsed.data.name || username).trim(),
        phone,
        passwordHash: hashPassword(parsed.data.password),
        apiKey: generateApiKey(),
        registerIp: isIgnorableIp(ip) ? "" : ip,
        emailVerified: false,
        phoneVerified: false,
        emailOtp,
        phoneOtp,
        otpExpiresAt,
        balance: 0,
      },
    });

    const synced = await upsertMemberInGist(member);
    if (!synced.ok) {
      console.error("member_gist_sync_failed", synced.error);
      await pushMembersToGist().catch(() => null);
    }

    const mail = await sendOtpEmail({
      to: email,
      subject: `TOLWEX doğrulama — ${WELCOME_BONUS_TRY}₺ bonus`,
      text: [
        `Merhaba ${member.username},`,
        ``,
        `TOLWEX yeni üye kampanyası: doğrulama sonrası ${WELCOME_BONUS_TRY}₺ bakiye bonusu hesabınıza yüklenecek.`,
        ``,
        `E-posta doğrulama kodu: ${emailOtp}`,
        `Telefon doğrulama kodu: ${phoneOtp}`,
        ``,
        `Kodlar 30 dakika geçerlidir.`,
        `R10 ve yeni üyeler için geçerlidir — aynı IP'den ikinci hesap açılamaz.`,
        ``,
        `https://tolwex.com/uye/dogrula`,
      ].join("\n"),
    });

    // Pending verify session (limited) — panel blocked until verified
    const session = await getSession();
    session.memberId = member.id;
    session.memberEmail = member.email;
    await session.save();

    await writeAuditLog({
      action: "member.register",
      actorType: "visitor",
      actorId: member.id,
      metadata: {
        email: member.email,
        username: member.username,
        phone,
        ip,
        gistSynced: synced.ok,
        mailDelivered: mail.delivered,
      },
    });

    return NextResponse.json({
      ok: true,
      needsVerify: true,
      welcomeBonus: WELCOME_BONUS_TRY,
      mailDelivered: mail.delivered,
      // If mail provider missing, show codes once so campaign still works
      ...(mail.delivered
        ? {}
        : { emailOtp, phoneOtp, otpNotice: "Kodlar e-postaya gönderilemedi — aşağıda gösterildi." }),
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        username: member.username,
        phone,
      },
      durable: synced.ok,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Kayıt hatası";
    console.error("register_failed", message);
    return NextResponse.json(
      { error: "Kayıt şu an yapılamıyor. Lütfen tekrar deneyin.", detail: message },
      { status: 500 }
    );
  }
}
