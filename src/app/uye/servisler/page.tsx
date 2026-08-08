"use client";

import { MemberGate } from "@/components/smm/MemberGate";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";

export default function MemberServicesPage() {
  return (
    <MemberGate>
      {() => (
        <div className="sp-page">
          <div className="sp-page-title">
            <h1>Servisler</h1>
            <p>Listeden seç → sipariş formuna geç. Fiyatlar /1000 adet.</p>
          </div>
          <ServiceCatalog memberMode />
        </div>
      )}
    </MemberGate>
  );
}
