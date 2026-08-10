"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function hideOnPath(path: string) {
  if (path.startsWith("/admin61")) return true;
  if (
    path.startsWith("/uye") &&
    !path.startsWith("/uye/giris") &&
    !path.startsWith("/uye/kayit") &&
    !path.startsWith("/uye/dogrula")
  ) {
    return true;
  }
  return false;
}

export function AnnouncementBanner() {
  const pathname = usePathname() || "/";
  const [text, setText] = useState<string | null>(null);
  const [style, setStyle] = useState<"mono" | "accent">("mono");

  useEffect(() => {
    if (hideOnPath(pathname)) {
      setText(null);
      return;
    }
    let alive = true;
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        if (d?.announcement_enabled && d?.announcement?.trim()) {
          setText(String(d.announcement).trim());
          setStyle(d.announcement_style === "accent" ? "accent" : "mono");
        } else {
          setText(null);
        }
      })
      .catch(() => {
        if (alive) setText(null);
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (!text) return null;

  return (
    <div className={`announce-banner style-${style}`} role="status">
      <div className="site-shell announce-banner-inner">
        <span className="announce-badge">Duyuru</span>
        <p className="announce-text">{text}</p>
      </div>
    </div>
  );
}
