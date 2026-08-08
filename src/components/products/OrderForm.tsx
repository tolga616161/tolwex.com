"use client";

import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";
import { AccountRecoveryForm } from "@/components/products/AccountRecoveryForm";

export function OrderForm({
  productId,
  productName,
  slug,
}: {
  productId: string;
  productName: string;
  slug?: string;
}) {
  if (slug === "kapanan-hesap-aktif-etme") {
    return <AccountRecoveryForm productId={productId} productName={productName} />;
  }

  const wa = whatsappUrl(
    `Merhaba, "${productName}" hizmeti için bilgi / teklif istiyorum.`
  );

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 space-y-3">
      <h3 className="display text-xl">Teklif Al</h3>
      <p className="muted text-sm">{productName}</p>
      <p className="text-sm leading-relaxed muted">
        WhatsApp’tan yazın; size özel teklif iletilelim. İhtiyaç (platform, yaş,
        adet) belirtirseniz daha hızlı dönüş yapılır.
      </p>
      <a
        href={wa}
        className="btn btn-primary w-full text-center"
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp {CONTACT_PHONE_DISPLAY}
      </a>
      <a href="tel:+905338236175" className="btn btn-ghost w-full text-center">
        Ara: {CONTACT_PHONE_DISPLAY}
      </a>
    </div>
  );
}
