"use client";

import Link from "next/link";

/** Public Instagram OAuth removed — button routes to SMM member flow. */
export function ConnectButton({
  label = "Hizmetlere git",
}: {
  label?: string;
  force?: boolean;
}) {
  return (
    <Link href="/hizmetler" className="btn btn-primary">
      {label === "Instagram Hesabımı Bağla" ||
      label === "Instagram’ı Bağla" ||
      label === "Instagram Hesabını Bağla" ||
      label === "Yeniden Bağlan"
        ? "SMM Hizmetler"
        : label}
    </Link>
  );
}
