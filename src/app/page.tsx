import type { Metadata } from "next";
import { RecoveryHome } from "@/components/recovery/RecoveryHome";

export const metadata: Metadata = {
  title: "TOLWEX | Teknik Destek",
  description:
    "Hesap, büyüme ve reklam teknik destek. Kategori seç, fotoğraf ekle, WhatsApp’tan ilet.",
};

export default function HomePage() {
  return <RecoveryHome />;
}
