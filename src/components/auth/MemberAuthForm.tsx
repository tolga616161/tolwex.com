"use client";

import { useState } from "react";
import Link from "next/link";

export function MemberAuthForm({
  mode,
  compact = false,
}: {
  mode: "login" | "register";
  compact?: boolean;
}) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "register" && password !== passwordAgain) {
        setError("Şifreler eşleşmiyor");
        return;
      }

      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { login, password }
          : {
              username,
              email,
              name: name.trim() || username,
              phone,
              password,
              passwordAgain,
            };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error ||
            (res.status >= 500
              ? "Sunucu hatası — lütfen birkaç saniye sonra tekrar deneyin"
              : "İşlem başarısız")
        );
        return;
      }

      // Confirm session cookie before entering panel
      const me = await fetch("/api/auth/me", { credentials: "same-origin" }).then((r) =>
        r.ok ? r.json() : null
      );
      if (!me?.member) {
        setError("Oturum açılamadı — sayfayı yenileyip tekrar deneyin");
        return;
      }

      // Full navigation so SSR panel sees the cookie reliably
      window.location.href = "/uye";
    } catch {
      setError("Ağ hatası — tekrar deneyin");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={`member-auth-card glass-panel ${compact ? "is-compact" : "rounded-3xl p-6 md:p-8"}`}
      onSubmit={submit}
    >
      <p className="section-kicker">{mode === "login" ? "Üye girişi" : "Üye kayıt"}</p>
      <h1 className={`display font-bold mb-2 ${compact ? "text-2xl" : "text-3xl"}`}>
        {mode === "login" ? "Panele giriş yap" : "Hesap oluştur"}
      </h1>
      <p className="muted text-sm mb-5">
        TOLWEX SMM paneli · kategoriden servis seç · sipariş ver
      </p>

      {mode === "register" ? (
        <>
          <label className="recovery-field mb-3">
            <span>Kullanıcı adı</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ornek_kullanici"
              required
              minLength={3}
              autoComplete="username"
            />
          </label>
          <label className="recovery-field mb-3">
            <span>E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="recovery-field mb-3">
            <span>Ad Soyad (opsiyonel)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="recovery-field mb-3">
            <span>Telefon (opsiyonel)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="recovery-field mb-3">
            <span>Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label className="recovery-field mb-4">
            <span>Şifre tekrar</span>
            <input
              type="password"
              value={passwordAgain}
              onChange={(e) => setPasswordAgain(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
        </>
      ) : (
        <>
          <label className="recovery-field mb-3">
            <span>Kullanıcı adı veya e-posta</span>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoComplete="username"
              placeholder="kullanici veya e-posta"
            />
          </label>
          <label className="recovery-field mb-4">
            <span>Şifre</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
        </>
      )}

      {error ? <p style={{ color: "#ff8a8a" }} className="text-sm mb-3">{error}</p> : null}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "…" : mode === "login" ? "Giriş yap" : "Kayıt ol"}
      </button>

      <p className="muted text-sm mt-4 text-center">
        {mode === "login" ? (
          <>
            Hesabın yok mu? <Link href="/uye/kayit">Üye ol</Link>
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
