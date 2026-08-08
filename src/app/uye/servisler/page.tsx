import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import { requireMemberPage } from "@/lib/member-page";

export const metadata = { title: "Servisler — TOLWEX" };
export const dynamic = "force-dynamic";

export default async function MemberServicesPage() {
  const member = await requireMemberPage();

  return (
    <MemberPanelShell
      username={member.username || member.name || "üye"}
      email={member.email}
      balance={member.balance}
    >
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">Servisler</p>
          <h1 className="section-title">Katalog</h1>
          <p className="section-sub">Satış fiyatları panellerde görünen fiyatlardır.</p>
        </div>
        <ServiceCatalog memberMode />
      </div>
    </MemberPanelShell>
  );
}
