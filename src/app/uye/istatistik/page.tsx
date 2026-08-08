import Link from "next/link";
import { prisma } from "@/lib/db";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { requireMemberPage } from "@/lib/member-page";

export const metadata = { title: "İstatistikler" };
export const dynamic = "force-dynamic";

export default async function MemberStatsPage() {
  const member = await requireMemberPage();

  const [totalOrders, openTickets, byStatus, lastOrders] = await Promise.all([
    prisma.smmOrder.count({ where: { memberId: member.id } }),
    prisma.supportTicket.count({
      where: { memberId: member.id, status: { in: ["open", "answered"] } },
    }),
    prisma.smmOrder.groupBy({
      by: ["status"],
      where: { memberId: member.id },
      _count: { _all: true },
    }),
    prisma.smmOrder.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));
  const completed = statusMap.completed || 0;
  const processing =
    (statusMap.processing || 0) + (statusMap.inprogress || 0) + (statusMap["in progress"] || 0);
  const pending = statusMap.pending || 0;

  return (
    <MemberPanelShell
      username={member.username || member.name || "üye"}
      email={member.email}
      balance={member.balance}
    >
      <div className="sp-page">
        <div className="sp-page-title">
          <h1>İstatistikler</h1>
          <p>Hesap özeti ve sipariş durumu</p>
        </div>

        <div className="sp-stat-grid">
          <article className="sp-stat tone-a">
            <span>Bakiye</span>
            <strong>{member.balance.toFixed(2)} ₺</strong>
          </article>
          <article className="sp-stat tone-b">
            <span>Toplam Harcama</span>
            <strong>{member.spent.toFixed(2)} ₺</strong>
          </article>
          <article className="sp-stat tone-c">
            <span>Toplam Sipariş</span>
            <strong>{totalOrders}</strong>
          </article>
          <article className="sp-stat tone-d">
            <span>Açık Destek</span>
            <strong>{openTickets}</strong>
          </article>
        </div>

        <div className="sp-stat-grid sm">
          <article className="sp-stat">
            <span>Completed</span>
            <strong>{completed}</strong>
          </article>
          <article className="sp-stat">
            <span>Processing</span>
            <strong>{processing}</strong>
          </article>
          <article className="sp-stat">
            <span>Pending</span>
            <strong>{pending}</strong>
          </article>
        </div>

        <div className="sp-actions">
          <Link href="/uye" className="btn btn-primary">
            Yeni Sipariş
          </Link>
          <Link href="/uye/bakiye" className="btn btn-ghost">
            Bakiye Yükle
          </Link>
        </div>

        <div className="sp-card">
          <div className="sp-card-head">
            <h2>Son siparişler</h2>
            <Link href="/uye/siparisler">Tümü</Link>
          </div>
          <div className="sp-table-wrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Servis</th>
                  <th>Adet</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {lastOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.providerOrderId || o.id.slice(0, 8)}</td>
                    <td>{o.serviceName}</td>
                    <td>{o.quantity}</td>
                    <td>{o.charge.toFixed(2)} ₺</td>
                    <td>
                      <span className={`sp-badge status-${o.status}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lastOrders.length === 0 ? (
              <p className="muted p-4 text-sm">Henüz sipariş yok.</p>
            ) : null}
          </div>
        </div>
      </div>
    </MemberPanelShell>
  );
}
