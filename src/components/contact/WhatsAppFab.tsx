"use client";

import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl("Merhaba, SecureLink ürünleri hakkında bilgi almak istiyorum.")}
      className="wa-fab"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp: ${CONTACT_PHONE_DISPLAY}`}
    >
      <span className="wa-fab-dot" aria-hidden />
      WhatsApp
    </a>
  );
}
