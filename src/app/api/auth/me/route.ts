import { NextResponse } from "next/server";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pullMembersFromGist } from "@/lib/members-durable";

const memberSelect = {
  id: true,
  email: true,
  name: true,
  username: true,
  phone: true,
  balance: true,
  spent: true,
  createdAt: true,
  emailVerified: true,
  phoneVerified: true,
  welcomeBonusAt: true,
} as const;

export async function GET() {
  await ensureDbHydrated(false);
  const session = await getSession();
  if (!session.memberId) {
    return NextResponse.json({ member: null });
  }

  let member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
    select: memberSelect,
  });

  if (!member) {
    await pullMembersFromGist({ force: true });
    member = await prisma.member.findFirst({
      where: { id: session.memberId, active: true },
      select: memberSelect,
    });
  }

  // Fallback: email from session (cold race after register)
  if (!member && session.memberEmail) {
    member = await prisma.member.findFirst({
      where: { email: session.memberEmail, active: true },
      select: memberSelect,
    });
    if (member) {
      session.memberId = member.id;
      await session.save();
    }
  }

  if (!member) {
    // Do NOT wipe session on first miss — Vercel cold start / gist lag.
    // Client can retry; only clear after explicit logout.
    return NextResponse.json({ member: null, pending: true });
  }

  const needsVerify = !member.emailVerified || !member.phoneVerified;
  return NextResponse.json({
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      username: member.username,
      phone: member.phone,
      balance: member.balance,
      spent: member.spent,
      createdAt: member.createdAt,
    },
    needsVerify,
  });
}
