"use client";

import { useRouter } from "next/navigation";

export function MemberPanelHeader({ name, email }: { name: string; email: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/uye/giris");
    router.refresh();
  }

  return (
    <header className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p className="section-kicker">Üye paneli</p>
        <h1 className="display text-3xl font-bold">Merhaba, {name}</h1>
        <p className="muted text-sm mt-1">{email}</p>
      </div>
      <button type="button" className="btn btn-ghost" onClick={logout}>
        Çıkış
      </button>
    </header>
  );
}
