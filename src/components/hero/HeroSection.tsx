"use client";

import Link from "next/link";
import { whatsappUrl } from "@/lib/contact";

export function HeroSection() {
  return (
    <section className="hero-stage">
      <div className="hero-copy">
        <p className="hero-kicker">TOLWEX · Social Intelligence</p>
        <h1 className="hero-title display">
          <span className="title-line">SOSYAL MEDYANIZI</span>
          <span className="title-line hero-title-accent">VERİYE DÖNÜŞTÜRÜN.</span>
        </h1>
        <p className="hero-sub">
          Profil ziyaret analizi, hesap güvenliği ve sosyal istihbarat —
          IP takibi veya şifre istemeden, profesyonel danışmanlık katmanında.
        </p>
        <div className="hero-actions">
          <Link href="/analiz/profilime-kim-bakti" className="btn btn-primary">
            Profilime Kim Baktı?
          </Link>
          <Link href="/instagram/security" className="btn btn-ghost">
            Hesap Güvenliği
          </Link>
          <a
            href={whatsappUrl("Merhaba, TOLWEX hizmetleri hakkında bilgi almak istiyorum.")}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
