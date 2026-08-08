"use client";

import Link from "next/link";

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
          TOLWEX, sosyal medya hesaplarınızın erişilebilen gerçek verilerini analiz
          ederek daha anlaşılır ve güçlü içgörüler sunar.
        </p>
        <div className="hero-actions">
          <Link href="/instagram/connect" className="btn btn-primary">
            Instagram ile Bağlan
          </Link>
          <a href="#nasil-calisir" className="btn btn-ghost">
            Nasıl Çalışır?
          </a>
        </div>
      </div>
    </section>
  );
}
