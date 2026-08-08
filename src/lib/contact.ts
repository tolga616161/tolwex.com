/** Public contact — WhatsApp / tel (site-wide) */
export const CONTACT_PHONE_E164 = "+905338236175";
export const CONTACT_PHONE_DISPLAY = "+90 533 823 61 75";
export const CONTACT_PHONE_DIGITS = "905338236175";

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT_PHONE_DIGITS}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function telUrl(): string {
  return `tel:${CONTACT_PHONE_E164}`;
}
