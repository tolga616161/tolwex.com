import Link from "next/link";
import { prisma } from "@/lib/db";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { requireMemberPage } from "@/lib/member-page";

export const metadata = { title: "Dashboard — TOLWEX" };
export const dynamic = "force-dynamic";

export default async function MemberDashboardPage() {
  const member = await requireMemberPage();

  const [orderCount, openTickets, lastOrders] = await Promise.all([
    prisma.smmOrder.count({ where: { memberId: member.id } }),
    prisma.supportTicket.count({
      where: { memberId: member.id, status: { in: ["open", "answered"] } },
    }),
    prisma.smmOrder.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <MemberPanelShell
      username={member.username || member.name || "üye"}
      email={member.email}
      balance={member.balance}
    >
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">Dashboard</p>
          <h1 className="section-title">Hoş geldin, {member.username}</h1>
          <p className="section-sub">Sipariş ver, bakiyeni yönet, destek al.</p>
        </div>

        <div className="member-stat-grid">
          <article className="glass-panel rounded-2xl p-5">
            <p className="muted text-xs">Bakiye</p>
            <p className="display text-2xl font-bold">{member.balance.toFixed(2)} ₺</p>
          </article>
          <article className="glass-panel rounded-2xl p-5">
            <p className="muted text-xs">Siparişler</p>
            <p className="display text-2xl font-bold">{orderCount}</p>
          </article>
          <article className="glass-panel rounded-2xl p-5">
            <p className="muted text-xs">Açık destek</p>
            <p className="display text-2xl font-bold">{openTickets}</p>
          </article>
        </div>

        <div className="flex flex-wrap gap-3 my-6">
          <Link href="/uye/yeni-siparis" className="btn btn-primary">
            Yeni Sipariş
          </Link>
          <Link href="/uye/bakiye" className="btn btn-ghost">
            Bakiye Yükle
          </Link>
          <Link href="/uye/servisler" className="btn btn-ghost">
            Servisler
          </Link>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h2 className="display text-lg mb-4">Son siparişler</h2>
          {lastOrders.length === 0 ? (
            <p className="muted text-sm">Henüz sipariş yok.</p>
          ) : (
            <ul className="member-list">
              {lastOrders.map((o) => (
                <li key={o.id}>
                  <span>{o.serviceName || `Servis #${o.providerServiceId}`}</span>
                  <span className="muted">
                    {o.status} · {o.charge.toFixed(2)} ₺
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MemberPanelShell>
  );
}
