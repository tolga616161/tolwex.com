"use client";

import { useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { IadeKosullari } from "@/components/legal/IadeKosullari";

type Me = { username: string; email: string; balance: number };

export default function MemberIadePage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/member/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p?.member) {
          setMe({
            username: p.member.username,
            email: p.member.email,
            balance: p.member.balance,
          });
        }
      });
  }, []);

  if (!me) {
    return (
      <div className="sp-shell">
        <div className="sp-main muted">Yükleniyor…</div>
      </div>
    );
  }

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="sp-page">
        <div className="sp-page-title">
          <h1>İade Koşulları</h1>
          <p>Sipariş, iptal, telafi ve bakiye iadesi</p>
        </div>
        <IadeKosullari variant="panel" />
      </div>
    </MemberPanelShell>
  );
}
