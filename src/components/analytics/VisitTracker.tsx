"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function sessionId(): string {
  try {
    const key = "tw_vid";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `v_${Date.now().toString(36)}`;
  }
}

function shouldSkip(path: string) {
  return path.startsWith("/admin61") || path.startsWith("/api");
}

/** Sends page enter/exit beacons for admin trafik panel. */
export function VisitTracker() {
  const pathname = usePathname() || "/";
  const visitId = useRef<string | null>(null);

  useEffect(() => {
    if (shouldSkip(pathname)) return;

    const sid = sessionId();
    let cancelled = false;

    fetch("/api/analytics/hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sid,
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
        event: "enter",
      }),
      credentials: "same-origin",
      keepalive: true,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.id) visitId.current = d.id;
      })
      .catch(() => null);

    const leave = () => {
      const id = visitId.current;
      if (!id) return;
      const payload = JSON.stringify({
        sessionId: sid,
        visitId: id,
        path: pathname,
        event: "leave",
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/analytics/hit",
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch("/api/analytics/hit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => null);
      }
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") leave();
    };
    window.addEventListener("pagehide", leave);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelled = true;
      leave();
      window.removeEventListener("pagehide", leave);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname]);

  return null;
}
