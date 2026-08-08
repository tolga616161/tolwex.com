import Link from "next/link";
import { DigitalAtmosphere } from "@/components/fx/DigitalAtmosphere";

export function HeroSection({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <section className="hero-stage hero-3d">
      <div className="hero-fx" aria-hidden>
        <span className="hero-grid" />
        <span className="hero-orb hero-orb-a" />
        <span className="hero-orb hero-orb-b" />
        <DigitalAtmosphere variant="hero" />
      </div>

      <div className="hero-copy">
        <p className="hero-kicker fade-up">Sosyal Medya Hizmetleri</p>
        <h1 className="hero-title display fade-up-delay">
          <span className="title-line">TOL</span>
          <span className="title-line hero-title-accent">WEX</span>
        </h1>
        <p className="hero-sub fade-up-delay-2">
          Eski tarihli hesaplar, kapanan hesap aktif etme, Meta Verified hataları
          ve Instagram güvenlik — teklif için WhatsApp.
        </p>
        <div className="hero-actions fade-up-delay-2">
          <Link href="/urunler" className="btn btn-primary">
            Hizmetleri Gör
          </Link>
          <Link
            href={configured ? "/instagram/connect" : "/urunler/eski-tarihli-hesaplar"}
            className="btn btn-ghost"
          >
            {configured ? "Instagram’ı Bağla" : "Eski Tarihli Hesaplar"}
          </Link>
        </div>
      </div>
    </section>
  );
}
