"use client";

import Link from "next/link";
import { whatsappUrl } from "@/lib/contact";

export function HeroSection() {
  return (
    <section className="hero-stage">
      <div className="hero-copy">
        <p className="hero-kicker">TOLWEX · Hesap Hizmetleri</p>
        <h1 className="hero-title display">
          <span className="title-line">META ESKİ &</span>
          <span className="title-line hero-title-accent">PROJELİ HESAPLAR.</span>
        </h1>
        <p className="hero-sub">
          Eski tarihli hesap, projeli paket ve kapanan hesap açma — kapanma
          ekranını yükle, nedeni yaz, WhatsApp’tan takip et.
        </p>
        <div className="hero-actions">
          <Link href="/hizmetler" className="btn btn-primary">
            SMM Hizmetler
          </Link>
          <Link href="/uye/giris" className="btn btn-ghost">
            Üye Girişi
          </Link>
          <Link href="/urunler/kapanan-hesap-aktif-etme" className="btn btn-ghost">
            Kapanan Hesap Aç
          </Link>
          <a
            href={whatsappUrl("Merhaba, hesap hizmetleri hakkında yazıyorum.")}
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
