import { NextResponse } from "next/server";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pullMembersFromGist } from "@/lib/members-durable";

export async function GET() {
  await ensureDbHydrated(true);
  await pullMembersFromGist();
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
    // Cold instance: pull again then retry once
    await pullMembersFromGist();
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
