"use client";

import Link from "next/link";
import { MemberAuthForm } from "@/components/auth/MemberAuthForm";

export function HeroSection() {
  return (
    <section className="hero-stage panel-hero">
      <div className="site-shell panel-hero-grid">
        <div className="hero-copy panel-hero-copy">
          <p className="hero-brand display">TOLWEX</p>
          <h1 className="hero-title hero-title-statement display">
            <span className="title-line">Dijitalde Karşınıza Çıkan</span>
            <span className="title-line hero-title-accent">Sorunları Birlikte Çözüyoruz</span>
          </h1>
          <p className="hero-sub">
            Binlerce servis, üye paneli, bakiye ve otomatik sipariş — tek yerden yönetin.
          </p>
          <div className="hero-actions">
            <Link href="/uye/kayit" className="btn btn-ghost">
              Üye ol
            </Link>
            <Link href="/hizmetler" className="btn btn-ghost">
              Servis listesi
            </Link>
          </div>
        </div>
        <div className="panel-hero-login">
          <MemberAuthForm mode="login" compact />
        </div>
      </div>
    </section>
  );
}
