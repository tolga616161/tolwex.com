"use client";

import { Suspense } from "react";
import { MemberGate } from "@/components/smm/MemberGate";
import { NewOrderForm } from "@/components/smm/NewOrderForm";

export default function MemberHomePage() {
  return (
    <MemberGate>
      {({ me }) => (
        <div className="sp-page">
          <div className="sp-page-title">
            <h1>Yeni Sipariş</h1>
            <p>
              Hoş geldin <strong>{me.username}</strong> — kategoriden servis seç, link gir, siparişi
              başlat.
            </p>
          </div>
          <Suspense fallback={<p className="muted">Servisler yükleniyor…</p>}>
            <NewOrderForm />
          </Suspense>
        </div>
      )}
    </MemberGate>
  );
}
