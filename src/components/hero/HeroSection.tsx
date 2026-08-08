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
        <p className="hero-kicker fade-up">Dijital Medya Platformu</p>
        <h1 className="hero-title display fade-up-delay">
          <span className="title-line">TOL</span>
          <span className="title-line hero-title-accent">WEX</span>
        </h1>
        <p className="hero-sub fade-up-delay-2">
          Haber silme, fake hesap kapatma ve Instagram güvenlik kontrolü.
          Hesap bağlarken şifre istemeyiz — yalnızca Meta’nın resmi ekranı.
        </p>
        <div className="hero-actions fade-up-delay-2">
          <Link href="/urunler" className="btn btn-primary">
            Ürünleri Gör
          </Link>
          {configured ? (
            <Link href="/instagram/connect" className="btn btn-ghost">
              Instagram’ı Bağla
            </Link>
          ) : (
            <Link href="/urunler/haber-silme" className="btn btn-ghost">
              Haber Silme
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
