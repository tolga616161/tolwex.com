"use client";

import { useState } from "react";
import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

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
        const detail =
          typeof data.detail === "string" && data.detail.length < 120
            ? ` (${data.detail})`
            : "";
        setError(
          (data.error ||
            (res.status === 401
              ? "Kullanıcı adı/e-posta veya şifre hatalı"
              : res.status === 409
                ? "Bu kullanıcı adı veya e-posta zaten kayıtlı"
                : res.status >= 500
                  ? "Sunucu hatası — lütfen birkaç saniye sonra tekrar deneyin"
                  : "İşlem başarısız")) + detail
        );
        return;
      }

      const me = await fetch("/api/auth/me", { credentials: "same-origin" }).then((r) =>
        r.ok ? r.json() : null
      );
      if (!me?.member) {
        setError("Oturum açılamadı — sayfayı yenileyip tekrar deneyin");
        return;
      }

      window.location.href = "/uye";
    } catch {
      setError("Ağ hatası — tekrar deneyin");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={`member-auth-card ${compact ? "is-compact" : "is-full"}`}
      onSubmit={submit}
    >
      {!compact ? (
        <div className="member-auth-brand">
          <TolwexLogo size="md" />
        </div>
      ) : null}

      <div className="member-auth-head">
        <h1>{mode === "login" ? "Giriş yap" : "Hesap oluştur"}</h1>
        <p>
          {compact
            ? "Panele hızlı giriş"
            : mode === "login"
              ? "Kullanıcı adın veya e-postan ile giriş yap"
              : "Birkaç saniyede üye ol, sipariş vermeye başla"}
        </p>
      </div>

      <div className="member-auth-fields">
        {mode === "register" ? (
          <>
            <label className="member-field">
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
            <label className="member-field">
              <span>E-posta</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            {!compact ? (
              <>
                <label className="member-field">
                  <span>Ad Soyad <em>(opsiyonel)</em></span>
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="member-field">
                  <span>Telefon <em>(opsiyonel)</em></span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
              </>
            ) : null}
            <label className="member-field">
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
            <label className="member-field">
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
            <label className="member-field">
              <span>Kullanıcı adı veya e-posta</span>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
                placeholder="kullanici veya e-posta"
              />
            </label>
            <label className="member-field">
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
      </div>

      {error ? <p className="member-auth-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary member-auth-submit" disabled={busy}>
        {busy ? "…" : mode === "login" ? "Giriş yap" : "Kayıt ol"}
      </button>

      <p className="member-auth-switch">
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
