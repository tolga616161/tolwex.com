/** Format TRY amounts for UI — max 2 decimals, TR locale. */
export function formatMoney(value: number, opts?: { currency?: boolean }) {
  const n = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return opts?.currency === false ? formatted : `${formatted} ₺`;
}

/** Round money to 2 decimals (half-up). */
export function roundMoney(value: number) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/** Ceil money to 2 decimals — protects margin when pricing. */
export function ceilMoney(value: number) {
  return Math.ceil((Number(value) - Number.EPSILON) * 100) / 100;
}
