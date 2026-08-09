import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  return NextResponse.json({
    member: {
      id: member.id,
      username: member.username,
      email: member.email,
      name: member.name,
      phone: member.phone,
      balance: member.balance,
      spent: member.spent,
      createdAt: member.createdAt,
    },
  });
}

const schema = z.object({
  name: z.string().max(80).optional(),
  phone: z.string().max(40).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional(),
});

export async function PATCH(req: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz form" }, { status: 400 });

  const data: { name?: string; phone?: string; passwordHash?: string } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone.trim();

  if (parsed.data.newPassword) {
    if (!parsed.data.currentPassword || !verifyPassword(parsed.data.currentPassword, member.passwordHash)) {
      return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });
    }
    data.passwordHash = hashPassword(parsed.data.newPassword);
  }

  const updated = await prisma.member.update({
    where: { id: member.id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      balance: true,
    },
  });
  const full = await prisma.member.findUniqueOrThrow({ where: { id: member.id } });
  const { upsertMemberInGist } = await import("@/lib/members-durable");
  await upsertMemberInGist(full);
  return NextResponse.json({ ok: true, member: updated });
}
