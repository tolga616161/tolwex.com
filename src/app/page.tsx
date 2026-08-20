import type { Metadata } from "next";
import { RecoveryHome } from "@/components/recovery/RecoveryHome";

export const metadata: Metadata = {
  title: "TOLWEX | Kapanan, Çalınan & Fake Hesap Kurtarma",
  description:
    "Instagram, Facebook, TikTok hesap kurtarma ve fake hesap şikayeti. Fotoğraf ekle, platform seç, WhatsApp’tan ilet.",
};

export default function HomePage() {
  return <RecoveryHome />;
}
