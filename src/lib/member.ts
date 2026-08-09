import { ensureDbHydrated, prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pullMembersFromGist, upsertMemberInGist } from "@/lib/members-durable";
import { pullPaymentsFromGist } from "@/lib/payments-durable";

export async function requireMember() {
  await ensureDbHydrated(true);
  await pullMembersFromGist();
  await pullPaymentsFromGist();
  const session = await getSession();
  if (!session.memberId) return null;
  let member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
  });
  if (!member) {
    await pullMembersFromGist();
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
