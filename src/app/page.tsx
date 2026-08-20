import type { Metadata } from "next";
import { RecoveryHome } from "@/components/recovery/RecoveryHome";

export const metadata: Metadata = {
  title: "TOLWEX | Kapanan & Çalınan Hesap Kurtarma",
  description:
    "Kapanan veya çalınan Instagram hesabı için başvuru formu. Ekran görüntüsü yükle, WhatsApp’tan ilet.",
};

export default function HomePage() {
  return <RecoveryHome />;
}
