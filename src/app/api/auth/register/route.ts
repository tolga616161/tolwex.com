import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`reg:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz form" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const exists = await prisma.member.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
  }

  const member = await prisma.member.create({
    data: {
      email,
      name: parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || "",
      passwordHash: hashPassword(parsed.data.password),
    },
  });

  const session = await getSession();
  session.memberId = member.id;
  session.memberEmail = member.email;
  await session.save();

  await writeAuditLog({
    action: "member.register",
    actorType: "visitor",
    actorId: member.id,
    metadata: { email: member.email },
  });

  return NextResponse.json({
    ok: true,
    member: { id: member.id, email: member.email, name: member.name },
  });
}
