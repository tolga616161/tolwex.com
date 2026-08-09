import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { generateApiKey } from "@/lib/api-key";
import { upsertMemberInGist } from "@/lib/members-durable";

const schema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Kullanıcı adı yalnızca harf, rakam, . _ -"),
    email: z.string().email().max(160),
    name: z
      .union([z.string().min(2).max(80), z.literal("")])
      .optional()
      .transform((v) => (v && v.trim() ? v.trim() : undefined)),
    phone: z.string().max(40).optional(),
    password: z.string().min(6).max(100),
    passwordAgain: z.string().min(6).max(100),
  })
  .refine((d) => d.password === d.passwordAgain, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordAgain"],
  });

export async function POST(req: NextRequest) {
  try {
    await ensureDbHydrated(true);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(`reg:${ip}`, 8, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Geçersiz form";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const username = parsed.data.username.trim().toLowerCase();
    const email = parsed.data.email.trim().toLowerCase();

    const existsUser = await prisma.member.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existsUser) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı veya e-posta zaten kayıtlı" },
        { status: 409 }
      );
    }

    const member = await prisma.member.create({
      data: {
        username,
        email,
        name: (parsed.data.name || username).trim(),
        phone: parsed.data.phone?.trim() || "",
        passwordHash: hashPassword(parsed.data.password),
        apiKey: generateApiKey(),
      },
    });

    // Persist to durable gist (retries inside). Don't block signup on transient 409.
    const synced = await upsertMemberInGist(member);
    if (!synced.ok) {
      console.error("member_gist_sync_failed", synced.error);
      // One more full merge push — often recovers after conflict
      const { pushMembersToGist } = await import("@/lib/members-durable");
      const pushed = await pushMembersToGist().catch(() => ({ ok: false as const }));
      if (!pushed.ok) {
        console.error("member_gist_push_failed", "ok" in pushed ? undefined : pushed);
      }
    }

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
        gistSynced: synced.ok,
      },
    });

    return NextResponse.json({
      ok: true,
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        username: member.username,
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
