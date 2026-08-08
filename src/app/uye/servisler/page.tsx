import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";

export const metadata = { title: "Servisler — Üye Paneli" };
export const dynamic = "force-dynamic";

export default async function MemberServicesPage() {
  const session = await getSession();
  if (!session.memberId) redirect("/uye/giris");
  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { email: true, username: true, name: true },
  });
  if (!member) redirect("/uye/giris");

  return (
    <MemberPanelShell username={member.username || member.name || "üye"} email={member.email}>
      <div className="glass-panel rounded-2xl p-5 md:p-6 mb-4">
        <h2 className="display text-2xl mb-1">Servisler</h2>
        <p className="muted text-sm">
          smmapi.com’dan otomatik çekilen katalog · satış = tedarikçi + %50
        </p>
      </div>
      <ServiceCatalog memberMode />
    </MemberPanelShell>
  );
}
