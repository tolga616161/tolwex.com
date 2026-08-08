import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

export const metadata = { title: "Siparişlerim — Üye Paneli" };
export const dynamic = "force-dynamic";

export default async function MemberOrdersPage() {
  const session = await getSession();
  if (!session.memberId) redirect("/uye/giris");
  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { id: true, email: true, username: true, name: true },
  });
  if (!member) redirect("/uye/giris");

  const orders = await prisma.smmOrder.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <MemberPanelShell username={member.username || member.name || "üye"} email={member.email}>
      <div className="glass-panel rounded-2xl p-5 md:p-6">
        <h2 className="display text-2xl mb-4">Siparişlerim</h2>
        {orders.length === 0 ? (
          <p className="muted text-sm">Henüz sipariş yok. Yeni Sipariş’ten başla.</p>
        ) : (
          <div className="orders-table">
            {orders.map((o) => (
              <article key={o.id} className="orders-row">
                <div>
                  <p className="font-semibold">{o.serviceName}</p>
                  <p className="muted text-xs break-all">{o.link}</p>
                </div>
                <div className="orders-meta">
                  <span>{o.quantity.toLocaleString("tr-TR")}</span>
                  <span>{o.charge.toFixed(2)} ₺</span>
                  <span className={`order-status is-${o.status}`}>{o.status}</span>
                  <span className="muted text-xs">
                    {o.providerOrderId ? `#${o.providerOrderId}` : "—"}
                  </span>
                  <span className="muted text-xs">
                    {new Date(o.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MemberPanelShell>
  );
}
