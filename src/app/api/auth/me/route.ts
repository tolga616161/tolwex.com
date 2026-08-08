import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ member: null });
  }
  const member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
    select: { id: true, email: true, name: true, phone: true, createdAt: true },
  });
  if (!member) {
    session.memberId = undefined;
    session.memberEmail = undefined;
    await session.save();
    return NextResponse.json({ member: null });
  }
  return NextResponse.json({ member });
}
