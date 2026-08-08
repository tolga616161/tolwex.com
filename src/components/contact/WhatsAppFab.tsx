"use client";

import { IconWhatsApp } from "@/components/icons/CategoryIcons";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl("Merhaba, TOLWEX hizmetleri hakkında bilgi almak istiyorum.")}
      className="wa-fab"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp: ${CONTACT_PHONE_DISPLAY}`}
      title={CONTACT_PHONE_DISPLAY}
    >
      <IconWhatsApp className="wa-fab-icon" />
      <span className="wa-fab-label">WhatsApp</span>
    </a>
  );
}
