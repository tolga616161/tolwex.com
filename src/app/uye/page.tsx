import { Suspense } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { NewOrderForm } from "@/components/smm/NewOrderForm";
import { requireMemberPage } from "@/lib/member-page";
import { prisma } from "@/lib/db";

export const metadata = { title: "Yeni Sipariş" };
export const dynamic = "force-dynamic";

export default async function MemberHomePage() {
  const member = await requireMemberPage();

  const news = await prisma.newsItem.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  return (
    <MemberPanelShell
      username={member.username || member.name || "üye"}
      email={member.email}
      balance={member.balance}
    >
      <div className="sp-page">
        <div className="sp-page-title">
          <h1>Yeni Sipariş</h1>
          <p>Kategori ve servisi listeden seçin, link/adet girip siparişi başlatın.</p>
        </div>

        {news.length ? (
          <div className="sp-card mb-4">
            <div className="sp-card-head">
              <h2>Duyurular</h2>
            </div>
            <ul className="sp-news">
              {news.map((n) => (
                <li key={n.id}>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Suspense fallback={<p className="muted">Sipariş formu yükleniyor…</p>}>
          <NewOrderForm />
        </Suspense>
      </div>
    </MemberPanelShell>
  );
}
