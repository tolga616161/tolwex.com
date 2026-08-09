import { NextResponse } from "next/server";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pullMembersFromGist } from "@/lib/members-durable";

export async function GET() {
  await ensureDbHydrated(false);
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ member: null });
  }
  let member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      phone: true,
      balance: true,
      spent: true,
      createdAt: true,
    },
  });
  if (!member) {
    await pullMembersFromGist({ force: true });
    member = await prisma.member.findFirst({
      where: { id: session.memberId, active: true },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        phone: true,
        balance: true,
        spent: true,
        createdAt: true,
      },
    });
  }
  if (!member) {
    session.memberId = undefined;
    session.memberEmail = undefined;
    await session.save();
    return NextResponse.json({ member: null });
  }
  return NextResponse.json({ member });
}
