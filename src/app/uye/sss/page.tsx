"use client";

import { useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

type Me = { username: string; email: string; balance: number };
type Faq = { id: string; question: string; answer: string };

export default function MemberFaqPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/member/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/faqs").then((r) => (r.ok ? r.json() : null)),
    ]).then(([p, f]) => {
      if (p?.member) {
        setMe({
          username: p.member.username,
          email: p.member.email,
          balance: p.member.balance,
        });
      }
      setFaqs(f?.faqs || []);
    });
  }, []);

  if (!me) return <div className="sp-shell"><div className="sp-main muted">Yükleniyor…</div></div>;

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="sp-page">
        <div className="sp-page-title">
          <h1>SSS</h1>
          <p>Sık sorulan sorular</p>
        </div>
        <div className="sp-faq-list">
          {faqs.map((f) => (
            <details key={f.id} className="sp-card sp-faq">
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </MemberPanelShell>
  );
}
