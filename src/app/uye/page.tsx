import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import { MemberPanelHeader } from "@/components/auth/MemberPanelHeader";

export const metadata = { title: "Üye Paneli — TOLWEX" };
export const dynamic = "force-dynamic";

export default async function MemberHomePage() {
  const session = await getSession();
  if (!session.memberId) redirect("/uye/giris");

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { id: true, name: true, email: true },
  });
  if (!member) redirect("/uye/giris");

  const orders = await prisma.smmOrder.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="site-shell py-10 pb-24">
      <MemberPanelHeader name={member.name || member.email} email={member.email} />
      <section className="mt-8">
        <h2 className="display text-2xl mb-2">Servisler</h2>
        <p className="muted text-sm mb-5">
          Fiyatlar tedarikçi oranının üzerine %50 kâr eklenmiş satış fiyatıdır (₺ / 1000).
        </p>
        <ServiceCatalog memberMode />
      </section>

      <section className="mt-12">
        <h2 className="display text-2xl mb-4">Son siparişler</h2>
        <div className="mono-panel">
          {orders.length === 0 ? (
            <p className="muted text-sm">Henüz sipariş yok.</p>
          ) : (
            <ul className="mono-list">
              {orders.map((o) => (
                <li key={o.id}>
                  {o.serviceName} · {o.quantity} · {o.charge.toFixed(2)} ₺ · {o.status}
                  {o.providerOrderId ? ` · #${o.providerOrderId}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
