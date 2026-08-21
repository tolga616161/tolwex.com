import type { Metadata } from "next";
import { RecoveryHome } from "@/components/recovery/RecoveryHome";

export const metadata: Metadata = {
  title: "TOLWEX | Kapanan & Çalınan Hesap",
  description:
    "Kapanan ve çalınan hesaplar için teknik çözüm. 2020’den beri tolgamedyam → TOLWEX.",
};

export default function HomePage() {
  return <RecoveryHome />;
}
