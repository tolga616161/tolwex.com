import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";

export function HeroSection({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <section className="hero-stage">
      <div className="hero-fx" aria-hidden>
        <span className="hero-grid" />
        <span className="hero-orb hero-orb-a" />
        <span className="hero-orb hero-orb-b" />
        <span className="hero-particles" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <p className="hero-kicker fade-up">Dijital Medya Platformu</p>
        <h1 className="hero-title display fade-up-delay">
          Secure
          <span className="hero-title-accent">Link</span>
        </h1>
        <p className="hero-sub fade-up-delay-2">
          Instagram hesabınızı resmi Meta OAuth ile bağlayın. Şifre, cookie veya session
          istemeyiz — yalnızca Meta’nın kendi giriş ekranı.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 fade-up-delay-2 mt-8">
          {configured ? (
            <ConnectButton label="Instagram Hesabımı Kontrol Et" force />
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
