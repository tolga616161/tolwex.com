import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureDbHydrated, prisma } from "@/lib/db";

export async function requireMemberPage() {
  await ensureDbHydrated();
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
      spent: true,
      apiKey: true,
      createdAt: true,
    },
  });
  if (!member) redirect("/uye/giris");
  return member;
}
