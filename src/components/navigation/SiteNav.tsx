"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MEGA_MENU } from "@/lib/categories";
import { CategoryIcon, IconWhatsApp } from "@/components/icons/CategoryIcons";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

const MOBILE_LINKS = [
  { label: "Tüm Hizmetler", href: "/urunler", icon: "ads" },
  { label: "Eski Tarihli Hesaplar", href: "/urunler/eski-tarihli-hesaplar", icon: "instagram" },
  { label: "Facebook Eski Hesap", href: "/urunler/facebook-eski-tarihli-hesaplar", icon: "facebook" },
  { label: "Kapanan Hesap Aktif", href: "/urunler/kapanan-hesap-aktif-etme", icon: "instagram" },
  { label: "Meta Verified", href: "/urunler/meta-verified-hatalari", icon: "facebook" },
  { label: "Haber Silme", href: "/urunler/haber-silme", icon: "seo" },
  { label: "Hesap Bağla", href: "/instagram/connect", icon: "social" },
];

export function SiteNav() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const mobileMenu =
    mounted &&
    createPortal(
      <div
        className={`mobile-sheet ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
        id="mobile-menu"
      >
        <div className="mobile-sheet-inner">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="brand display"
              onClick={() => setMobileOpen(false)}
            >
              TOL<span>WEX</span>
            </Link>
            <button
              type="button"
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
            >
              Kapat
            </button>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] muted mb-4">Hizmet menüsü</p>
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
              Tüm Hizmetler
            </Link>
            <a
              href={whatsappUrl()}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
            >
              WhatsApp {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <header className="site-nav">
      <div className="site-shell nav-inner">
        <button
          type="button"
          className={`hamburger ${mobileOpen ? "is-open" : ""}`}
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMobileOpen((v) => !v);
          }}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/" className="brand display">
          TOL<span>WEX</span>
        </Link>

        <nav className="nav-desktop">
          <Link href="/urunler" className="nav-link">
            Hizmetler
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
              Kategoriler
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
          <a
            href={whatsappUrl()}
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
            title={CONTACT_PHONE_DISPLAY}
          >
            WhatsApp
          </a>
          <Link href="/urunler" className="btn btn-primary nav-cta">
            Hizmetler
          </Link>
        </nav>

        <a
          href={whatsappUrl()}
          className="nav-mobile-wa"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          title={CONTACT_PHONE_DISPLAY}
        >
          <IconWhatsApp className="nav-wa-icon" />
        </a>
      </div>
      {mobileMenu}
    </header>
  );
}
