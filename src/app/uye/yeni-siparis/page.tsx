import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { NewOrderForm } from "@/components/smm/NewOrderForm";
import { requireMemberPage } from "@/lib/member-page";

export const metadata = { title: "Yeni Sipariş" };
export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const member = await requireMemberPage();

  return (
    <MemberPanelShell
      username={member.username || member.name || "üye"}
      email={member.email}
      balance={member.balance}
    >
      <NewOrderForm />
    </MemberPanelShell>
  );
}
