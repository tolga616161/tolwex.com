import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { pullMembersFromGist } from "@/lib/members-durable";

export async function requireMemberPage() {
  await ensureDbHydrated();
  const session = await getSession();
  if (!session.memberId) redirect("/uye/giris");

  let member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      balance: true,
      spent: true,
      apiKey: true,
      createdAt: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  if (!member) {
    await pullMembersFromGist({ force: true });
    member = await prisma.member.findFirst({
      where: { id: session.memberId, active: true },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        balance: true,
        spent: true,
        apiKey: true,
        createdAt: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });
  }

  if (!member) redirect("/uye/giris");

  if (!member.emailVerified || !member.phoneVerified) {
    await prisma.member
      .update({
        where: { id: member.id },
        data: { emailVerified: true, phoneVerified: true, emailOtp: "", phoneOtp: "" },
      })
      .catch(() => null);
  }

  return {
    id: member.id,
    username: member.username,
    email: member.email,
    name: member.name,
    phone: member.phone,
    balance: member.balance,
    spent: member.spent,
    apiKey: member.apiKey,
    createdAt: member.createdAt,
  };
}
