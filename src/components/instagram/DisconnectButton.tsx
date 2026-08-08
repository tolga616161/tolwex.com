"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DisconnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onDisconnect() {
    if (!confirm("Instagram bağlantısı kaldırılsın mı? Saklanan token silinecek.")) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/meta/disconnect", { method: "POST" });
      const data = await res.json();
      setMessage(data.message || "Bağlantı kaldırıldı.");
      router.refresh();
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setMessage("İşlem tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-danger"
        onClick={onDisconnect}
        disabled={loading}
      >
        {loading ? "Kaldırılıyor…" : "Instagram bağlantısını kaldır"}
      </button>
      {message ? <p className="mt-3 text-sm muted">{message}</p> : null}
    </div>
  );
}
