import type { Metadata } from "next";
import { RecoveryHome } from "@/components/recovery/RecoveryHome";

export const metadata: Metadata = {
  title: "TOLWEX | Hesap Kurtarma",
  description:
    "Kapanan, çalınan ve fake hesap başvurusu. Fotoğraf ekle, platform seç, WhatsApp’tan ilet.",
};

export default function HomePage() {
  return <RecoveryHome />;
}
