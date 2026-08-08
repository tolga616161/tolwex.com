"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MEGA_MENU } from "@/lib/categories";
import { CategoryIcon } from "@/components/icons/CategoryIcons";

const MOBILE_LINKS = [
  { label: "Ürün Kataloğu", href: "/urunler", icon: "ads" },
  { label: "Instagram Ürün", href: "/urunler/instagram-yonetim-paketi", icon: "instagram" },
  { label: "Meta Ads", href: "/urunler/meta-ads-baslangic", icon: "facebook" },
  { label: "TikTok Paket", href: "/urunler/tiktok-icerik-paketi", icon: "tiktok" },
  { label: "Google Ads", href: "/urunler/google-ads-arama", icon: "google" },
  { label: "SEO", href: "/urunler/seo-baslangic-denetimi", icon: "seo" },
  { label: "Web Tasarım", href: "/urunler/web-tasarim-landing", icon: "design" },
  { label: "Hesap Bağla", href: "/instagram/connect", icon: "social" },
];

export function SiteNav() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="site-nav">
      <div className="site-shell nav-inner">
        <Link href="/" className="brand display">
          Secure<span>Link</span>
        </Link>

        <nav className="nav-desktop">
          <Link href="/urunler" className="nav-link">
            Katalog
          </Link>
          <div
            className="mega-wrap"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              className={`nav-link ${megaOpen ? "is-on" : ""}`}
              aria-expanded={megaOpen}
              onClick={() => setMegaOpen((v) => !v)}
            >
              Ürünler
              <span className="chev">▾</span>
            </button>
            <div className={`mega-panel ${megaOpen ? "is-open" : ""}`}>
              <div className="mega-grid">
                {MEGA_MENU.map((col) => (
                  <div key={col.title}>
                    <p className="mega-title">{col.title}</p>
                    <ul className="mega-list">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            className="mega-item"
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className="mega-item-label">{item.label}</span>
                            <span className="mega-item-desc">{item.desc}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Link href="/instagram/connect" className="nav-link">
            Bağla
          </Link>
          <Link href="/admin" className="nav-link">
            Admin
          </Link>
          <Link href="/urunler" className="btn btn-primary nav-cta">
            Mağaza
          </Link>
        </nav>

        <button
          type="button"
          className="hamburger"
          aria-label="Menüyü aç"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-sheet ${mobileOpen ? "is-open" : ""}`}>
        <div className="mobile-sheet-inner">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="brand display" onClick={() => setMobileOpen(false)}>
              Secure<span>Link</span>
            </Link>
            <button type="button" className="mobile-close" onClick={() => setMobileOpen(false)}>
              Kapat
            </button>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] muted mb-4">Ürün menüsü</p>
          <div className="mobile-cats">
            {MOBILE_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="mobile-cat"
                onClick={() => setMobileOpen(false)}
              >
                <CategoryIcon name={l.icon} className="size-6" />
                <span>{l.label}</span>
              </a>
            ))}
          </div>
          <div className="mt-8 grid gap-3">
            <Link
              href="/urunler"
              className="btn btn-primary"
              onClick={() => setMobileOpen(false)}
            >
              Ürün Kataloğunu Aç
            </Link>
            <Link
              href="/admin"
              className="btn btn-ghost"
              onClick={() => setMobileOpen(false)}
            >
              Admin Paneli
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
