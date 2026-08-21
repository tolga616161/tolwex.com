"use client";

import { usePathname } from "next/navigation";
import { IconWhatsApp } from "@/components/icons/CategoryIcons";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function WhatsAppFab() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin61")) return null;

  return (
    <a
      href={whatsappUrl("Merhaba, TOLWEX Sosyal Medya Uzmanı — destek için yazıyorum.")}
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
