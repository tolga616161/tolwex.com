"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function MemberAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login"
        ? { email, password }
        : { name, email, phone, password };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "İşlem başarısız");
      return;
    }
    router.push("/uye");
    router.refresh();
  }

  return (
    <form className="member-auth-card glass-panel rounded-3xl p-6 md:p-8" onSubmit={submit}>
      <p className="section-kicker">{mode === "login" ? "Üye girişi" : "Kayıt ol"}</p>
      <h1 className="display text-3xl font-bold mb-2">
        {mode === "login" ? "Hesabına giriş yap" : "Üye ol"}
      </h1>
      <p className="muted text-sm mb-5">
        SMM hizmetlerini %50 kârlı satış fiyatlarıyla sipariş et.
      </p>

      {mode === "register" ? (
        <>
          <label className="recovery-field mb-3">
            <span>Ad</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="recovery-field mb-3">
            <span>Telefon</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </>
      ) : null}

      <label className="recovery-field mb-3">
        <span>E-posta</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="recovery-field mb-4">
        <span>Şifre</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </label>

      {error ? <p style={{ color: "#ff8a8a" }} className="text-sm mb-3">{error}</p> : null}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "…" : mode === "login" ? "Giriş yap" : "Kayıt ol"}
      </button>

      <p className="muted text-sm mt-4 text-center">
        {mode === "login" ? (
          <>
            Hesabın yok mu? <Link href="/uye/kayit">Kayıt ol</Link>
          </>
        ) : (
          <>
            Zaten üye misin? <Link href="/uye/giris">Giriş yap</Link>
          </>
        )}
      </p>
    </form>
  );
}
