import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Eski ürün detayları kaldırıldı — SMM katalog. */
export default async function ProductDetailPage() {
  redirect("/hizmetler");
}
