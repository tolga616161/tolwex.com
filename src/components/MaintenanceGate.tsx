"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MaintenanceScene from "@/components/MaintenanceScene";

type MaintState = {
  active: boolean;
  until: string | null;
  remainingMs: number;
  hours: number;
  message: string;
};

const DEFAULT_MSG =
  "Sitemiz şu anda planlı bakımda. Kısa süre içinde yeniden hizmetinizdeyiz.";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin61");
  const [state, setState] = useState<MaintState | null>(null);

  useEffect(() => {
    if (isAdmin) return;
    let alive = true;
    let pollTimer: number | undefined;
    let endTimer: number | undefined;

    const load = async () => {
      try {
        const res = await fetch("/api/settings/public", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const m = data?.maintenance;
        if (!alive || !m) return;
        const remainingMs = Number(m.remainingMs || 0);
        setState({
          active: Boolean(m.active),
          until: m.until ?? null,
          remainingMs,
          hours: Number(m.hours || 24),
          message: String(m.message || DEFAULT_MSG),
        });
        if (pollTimer) window.clearTimeout(pollTimer);
        if (endTimer) window.clearTimeout(endTimer);
        if (m.active && remainingMs > 0) {
          pollTimer = window.setTimeout(load, Math.min(remainingMs, 30_000));
          endTimer = window.setTimeout(load, remainingMs + 400);
        } else {
          pollTimer = window.setTimeout(load, 15_000);
        }
      } catch {
        pollTimer = window.setTimeout(load, 15_000);
      }
    };

    void load();
    return () => {
      alive = false;
      if (pollTimer) window.clearTimeout(pollTimer);
      if (endTimer) window.clearTimeout(endTimer);
    };
  }, [isAdmin]);

  if (!isAdmin && state?.active) {
    return (
      <MaintenanceScene
        key={state.until || "maint"}
        remainingMs={state.remainingMs}
        message={state.message || DEFAULT_MSG}
        until={state.until}
      />
    );
  }

  return <>{children}</>;
}
