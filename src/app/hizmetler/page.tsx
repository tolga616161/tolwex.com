import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import Link from "next/link";

export const metadata = {
  title: "Hizmetler",
  description: "TOLWEX SMM hizmet listesi — Instagram, TikTok, YouTube ve daha fazlası.",
};

export default function HizmetlerPage() {
  return (
    <div className="site-shell py-10 pb-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="section-kicker">SMM Katalog</p>
          <h1 className="display text-4xl md:text-5xl font-bold">Hizmetler</h1>
          <p className="muted mt-2 max-w-2xl">
            TOLWEX katalogundaki tüm SMM hizmetleri. Fiyatlar 1000 adet üzerinden listelenir;
            sipariş için üye girişi yeterlidir.
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
