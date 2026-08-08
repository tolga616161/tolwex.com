import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function requireMemberPage() {
  const session = await getSession();
  if (!session.memberId) redirect("/uye/giris");

  const member = await prisma.member.findFirst({
    where: { id: session.memberId, active: true },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      balance: true,
      createdAt: true,
    },
  });
  if (!member) redirect("/uye/giris");
  return member;
}
