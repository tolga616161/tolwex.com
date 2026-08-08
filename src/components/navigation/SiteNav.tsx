"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TolwexLogo } from "@/components/brand/TolwexLogo";
import { whatsappUrl } from "@/lib/contact";

const NAV = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Üye Girişi", href: "/uye/giris" },
  { label: "Kayıt Ol", href: "/uye/kayit" },
  { label: "Nasıl Çalışır?", href: "/#nasil-calisir" },
];

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const wa = whatsappUrl("Merhaba, TOLWEX SMM hakkında yazıyorum.");

  const mobileMenu =
    mounted &&
    createPortal(
      <div
        className={`mobile-sheet ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
        id="mobile-menu"
      >
        <div className="mobile-sheet-inner">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <TolwexLogo size="md" />
            </Link>
            <button
              type="button"
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
            >
              Kapat
            </button>
          </div>
          <nav className="mobile-nav-list">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-10 grid gap-3">
            <Link
              href="/hizmetler"
              className="btn btn-ghost"
              onClick={() => setMobileOpen(false)}
            >
              SMM Hizmetler
            </Link>
            <Link
              href="/uye/giris"
              className="btn btn-primary"
              onClick={() => setMobileOpen(false)}
            >
              Üye Girişi
            </Link>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-shell nav-inner">
        <button
          type="button"
          className={`hamburger ${mobileOpen ? "is-open" : ""}`}
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/" className="nav-brand" aria-label="TOLWEX ana sayfa">
          <TolwexLogo size="sm" />
        </Link>

        <nav className="nav-desktop" aria-label="Ana menü">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <Link href="/uye/giris" className="nav-link nav-login">
            Üye Girişi
          </Link>
          <a href={wa} className="btn btn-primary nav-cta" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
      </div>
      {mobileMenu}
    </header>
  );
}
