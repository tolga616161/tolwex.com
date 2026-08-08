import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  return NextResponse.json({ balance: member.balance });
}

const schema = z.object({
  amount: z.number().positive().max(100000),
  method: z.string().max(40).default("whatsapp"),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`bal:${member.id}:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz tutar" }, { status: 400 });

  const row = await prisma.balanceRequest.create({
    data: {
      memberId: member.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      note: parsed.data.note?.trim() || "",
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, request: row });
}
