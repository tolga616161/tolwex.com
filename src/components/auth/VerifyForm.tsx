"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

export function VerifyForm() {
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("tolwex_otp");
      if (cached) {
        const j = JSON.parse(cached) as { emailOtp?: string; phoneOtp?: string };
        if (j.emailOtp) setEmailOtp(j.emailOtp);
        if (j.phoneOtp) setPhoneOtp(j.phoneOtp);
      }
    } catch {
      /* ignore */
    }

    fetch("/api/auth/verify", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.member) {
          setError("Oturum yok — önce kayıt olun veya giriş yapın");
          return;
        }
        if (!d.needsVerify) {
          window.location.href = "/uye";
          return;
        }
        setEmail(d.member.email || "");
        if (d.expired) setInfo("Kodların süresi dolmuş olabilir — yeni kod isteyin");
      })
      .catch(() => setError("Doğrulama durumu alınamadı"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ emailOtp, phoneOtp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Doğrulama başarısız");
        return;
      }
      try {
        sessionStorage.removeItem("tolwex_otp");
      } catch {
        /* ignore */
      }
      window.location.href = "/uye";
    } catch {
      setError("Ağ hatası");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "PUT",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Kod gönderilemedi");
        return;
      }
      if (data.emailOtp && data.phoneOtp) {
        setEmailOtp(data.emailOtp);
        setPhoneOtp(data.phoneOtp);
        try {
          sessionStorage.setItem(
            "tolwex_otp",
            JSON.stringify({ emailOtp: data.emailOtp, phoneOtp: data.phoneOtp })
          );
        } catch {
          /* ignore */
        }
        setInfo("Yeni kodlar oluşturuldu");
      } else {
        setInfo("Yeni kodlar e-postanıza gönderildi");
      }
    } catch {
      setError("Ağ hatası");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="member-auth-card is-full" onSubmit={submit}>
      <div className="member-auth-brand">
        <TolwexLogo size="md" />
      </div>
      <div className="member-auth-head">
        <h1>Hesabı doğrula</h1>
        <p>
          {email ? (
            <>
              <strong>{email}</strong> adresine giden e-posta ve telefon kodlarını gir.
              Doğrulama hesabını açar — bakiye hediyesi kayıtta yok; IBAN ile 500₺+
              yatırınca +500₺ hediye gelir.
            </>
          ) : (
            <>E-posta ve telefon doğrulama kodlarını girin.</>
          )}
        </p>
      </div>

      <div className="member-auth-fields">
        <label className="member-field">
          <span>E-posta doğrulama kodu</span>
          <input
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="6 haneli kod"
          />
        </label>
        <label className="member-field">
          <span>Telefon doğrulama kodu</span>
          <input
            value={phoneOtp}
            onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            required
            placeholder="6 haneli kod"
          />
        </label>
      </div>

      {info ? <p className="muted text-sm">{info}</p> : null}
      {error ? <p className="member-auth-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary member-auth-submit" disabled={busy}>
        {busy ? "…" : "Doğrula ve panele gir"}
      </button>
      <button
        type="button"
        className="btn btn-ghost member-auth-submit"
        disabled={busy}
        onClick={() => void resend()}
      >
        Yeni kod gönder
      </button>

      <p className="member-auth-switch">
        <Link href="/uye/giris">Girişe dön</Link>
      </p>
    </form>
  );
}
