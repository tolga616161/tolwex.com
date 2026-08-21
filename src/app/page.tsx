import type { Metadata } from "next";
import { RecoveryHome } from "@/components/recovery/RecoveryHome";

export const metadata: Metadata = {
  title: "TOLWEX | Sosyal Medya Uzmanı",
  description:
    "Kapanan hesap, askıya alınan hesap, kullanıcı adı alma. Instagram, TikTok, X — teknik çözümler.",
};

export default function HomePage() {
  return <RecoveryHome />;
}
