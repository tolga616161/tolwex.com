"use client";

import Link from "next/link";
import { whatsappUrl } from "@/lib/contact";

export function HeroSection() {
  return (
    <section className="hero-stage">
      <div className="hero-copy">
        <p className="hero-kicker">TOLWEX · SMM Panel</p>
        <h1 className="hero-title display">
          <span className="title-line">SMM HİZMETLERİ</span>
          <span className="title-line hero-title-accent">OTOMATİK KATALOG.</span>
        </h1>
        <p className="hero-sub">
          smmapi.com servisleri otomatik listelenir. Fiyatlara %50 kâr eklenir.
          Üye girişi ile sipariş ver — Instagram bağlama yok.
        </p>
        <div className="hero-actions">
          <Link href="/#hizmetler" className="btn btn-primary">
            Hizmetleri gör
          </Link>
          <Link href="/uye/giris" className="btn btn-ghost">
            Üye Girişi
          </Link>
          <a
            href={whatsappUrl("Merhaba, SMM hizmetleri hakkında yazıyorum.")}
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
