"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

export type MemberMe = {
  id: string;
  username: string;
  email: string;
  name: string;
  balance: number;
  spent: number;
};

export type MemberGateApi = {
  me: MemberMe;
  refreshMe: () => Promise<void>;
  setBalance: (balance: number) => void;
};

/** Client-side auth gate — avoids SSR instance race after register/login. */
export function MemberGate({
  children,
}: {
  children: (api: MemberGateApi) => ReactNode;
}) {
  const router = useRouter();
  const [me, setMe] = useState<MemberMe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    const res = await fetch("/api/member/profile", { credentials: "same-origin" });
    if (res.status === 401) {
      router.replace("/uye/giris");
      return;
    }
    const data = await res.json().catch(() => null);
    if (!data?.member) {
      router.replace("/uye/giris");
      return;
    }
    setMe({
      id: data.member.id,
      username: data.member.username || data.member.name || "üye",
      email: data.member.email,
      name: data.member.name || "",
      balance: Number(data.member.balance) || 0,
      spent: Number(data.member.spent) || 0,
    });
  }, [router]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await refreshMe();
      } catch {
        if (alive) setError("Bağlantı hatası");
      }
    })();
    const onFocus = () => {
      refreshMe().catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshMe]);

  if (error) {
    return (
      <div className="sp-shell">
        <div className="sp-main">
          <p className="sp-err">{error}</p>
          <a href="/uye/giris" className="btn btn-primary">
            Girişe dön
          </a>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="sp-shell">
        <div className="sp-main muted">Panel yükleniyor…</div>
      </div>
    );
  }

  const api: MemberGateApi = {
    me,
    refreshMe,
    setBalance: (balance: number) => setMe((m) => (m ? { ...m, balance } : m)),
  };

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      {children(api)}
    </MemberPanelShell>
  );
}
