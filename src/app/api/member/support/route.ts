import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const tickets = await prisma.supportTicket.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ tickets });
}

const schema = z.object({
  subject: z.string().min(3).max(160),
  message: z.string().min(5).max(4000),
});

export async function POST(req: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz form" }, { status: 400 });

  const ticket = await prisma.supportTicket.create({
    data: {
      memberId: member.id,
      subject: parsed.data.subject.trim(),
      message: parsed.data.message.trim(),
    },
  });
  return NextResponse.json({ ok: true, ticket });
}
