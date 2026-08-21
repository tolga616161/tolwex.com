import type { Metadata } from "next";
import { RecoveryHome } from "@/components/recovery/RecoveryHome";

export const metadata: Metadata = {
  title: "TOLWEX | Sosyal Medya Uzmanı",
  description:
    "TOLWEX Sosyal Medya Uzmanı — kapanan, çalınan ve kısıtlanan hesaplar için teknik çözüm. 2020’den beri tolgamedyam → TOLWEX.",
};

export default function HomePage() {
  return <RecoveryHome />;
}
