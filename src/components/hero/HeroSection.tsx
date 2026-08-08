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
        <span className="hero-particles" />
        <DigitalAtmosphere variant="hero" />
      </div>

      <div className="relative z-10 max-w-3xl hero-copy">
        <p className="hero-kicker fade-up">Dijital Medya Platformu</p>
        <h1 className="hero-title display fade-up-delay">
          <span className="title-3d">
            Secure
            <span className="hero-title-accent">Link</span>
          </span>
        </h1>
        <p className="hero-sub fade-up-delay-2">
          Instagram hesabınızı resmi Meta OAuth ile bağlayın. Şifre, cookie veya session
          istemeyiz — yalnızca Meta’nın kendi giriş ekranı.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 fade-up-delay-2 mt-8">
          {configured ? (
            <Link href="/instagram/connect" className="btn btn-primary pulse-ring">
              Instagram Hesabımı Kontrol Et
            </Link>
          ) : (
            <Link href="/admin/setup" className="btn btn-ghost">
              Meta entegrasyonu henüz yapılandırılmadı
            </Link>
          )}
          <a href="#categories" className="btn btn-ghost">
            Hizmetleri keşfet
          </a>
        </div>
      </div>
    </section>
  );
}
