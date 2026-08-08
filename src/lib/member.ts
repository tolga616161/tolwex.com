import { ensureDbHydrated, prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pullMembersFromGist, pushMembersToGist } from "@/lib/members-durable";

export async function requireMember() {
  await ensureDbHydrated(true);
  await pullMembersFromGist();
  const session = await getSession();
  if (!session.memberId) return null;
  return prisma.member.findFirst({
    where: { id: session.memberId, active: true },
  });
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
  await pushMembersToGist();
  return member;
}
