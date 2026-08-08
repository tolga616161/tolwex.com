import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import Link from "next/link";

export const metadata = {
  title: "SMM Hizmetleri — TOLWEX",
  description: "Instagram, TikTok, Facebook ve diğer SMM servisleri — otomatik liste, %50 kârlı fiyat.",
};

export default function HizmetlerPage() {
  return (
    <div className="site-shell py-10 pb-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="section-kicker">SMM Katalog</p>
          <h1 className="display text-4xl md:text-5xl font-bold">Hizmetler</h1>
          <p className="muted mt-2 max-w-2xl">
            smmapi.com üzerinden senkronize edilen tüm servisler. Satış fiyatı = tedarikçi
            fiyatı + %50 kâr.
          </p>
        </div>
        <Link href="/uye/giris" className="btn btn-primary">
          Üye girişi / Sipariş
        </Link>
      </div>
      <ServiceCatalog />
    </div>
  );
}
