import { ensureDbHydrated, prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pullMembersFromGist, upsertMemberInGist } from "@/lib/members-durable";

export async function requireMember() {
  // Warm path: cached hydrate. Cold / missing member: force pull once.
  await ensureDbHydrated(false);
  const session = await getSession();
  if (!session.memberId) return null;
  let member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
  });
  if (!member) {
    await pullMembersFromGist({ force: true });
    member = await prisma.member.findFirst({
      where: { id: session.memberId, active: true },
    });
  }
  if (!member && session.memberEmail) {
    member = await prisma.member.findFirst({
      where: { email: session.memberEmail, active: true },
    });
  }
  if (!member) return null;
  // Unverified accounts cannot use panel APIs
  if (!member.emailVerified || !member.phoneVerified) return null;
  return member;
}

/** Session member even if not verified (for OTP page). */
export async function requireMemberPending() {
  await ensureDbHydrated(false);
  const session = await getSession();
  if (!session.memberId) return null;
  let member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
  });
  if (!member) {
    await pullMembersFromGist({ force: true });
    member = await prisma.member.findFirst({
      where: { id: session.memberId, active: true },
    });
  }
  return member;
}

export async function adjustBalance(
  memberId: string,
  amount: number,
  type: string,
  note = "",
  refId = ""
) {
  const member = await prisma.member.update({
    where: { id: memberId },
    data: { balance: { increment: amount } },
  });
  await prisma.walletTransaction.create({
    data: {
      memberId,
      type,
      amount,
      balanceAfter: member.balance,
      note,
      refId,
    },
  });
  await upsertMemberInGist(member);
  return member;
}
