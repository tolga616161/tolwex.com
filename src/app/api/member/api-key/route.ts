import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import { generateApiKey } from "@/lib/api-key";

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  return NextResponse.json({ apiKey: member.apiKey });
}

export async function POST() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const apiKey = generateApiKey();
  await prisma.member.update({ where: { id: member.id }, data: { apiKey } });
  return NextResponse.json({ ok: true, apiKey });
}
