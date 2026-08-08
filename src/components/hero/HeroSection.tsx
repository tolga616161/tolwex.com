"use client";

import Link from "next/link";
import { MemberAuthForm } from "@/components/auth/MemberAuthForm";

export function HeroSection() {
  return (
    <section className="hero-stage panel-hero">
      <div className="site-shell panel-hero-grid">
        <div className="hero-copy panel-hero-copy">
          <p className="hero-kicker">TOLWEX · SMM Panel</p>
          <h1 className="hero-title display">
            <span className="title-line">EN İYİ SMM</span>
            <span className="title-line hero-title-accent">PAZARLAMA PANELİ.</span>
          </h1>
          <p className="hero-sub">
            smmapi.com servisleri otomatik senkron. Üye ol, giriş yap, sipariş ver —
            Instagram bağlama yok.
          </p>
          <div className="panel-stats">
            <div>
              <strong>2000+</strong>
              <span>Servis</span>
            </div>
            <div>
              <strong>%50</strong>
              <span>Kârlı fiyat</span>
            </div>
            <div>
              <strong>7/24</strong>
              <span>Otomasyon</span>
            </div>
          </div>
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
