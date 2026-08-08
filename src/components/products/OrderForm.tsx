"use client";

import { useState } from "react";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function OrderForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/products/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, phone, email, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sipariş gönderilemedi");
      setDone("Sipariş talebiniz alındı. WhatsApp’tan da yazabilirsiniz.");
      setName("");
      setPhone("");
      setEmail("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass-panel rounded-2xl p-5 md:p-6 space-y-3">
      <h3 className="display text-xl">Sipariş / Teklif Formu</h3>
      <p className="muted text-sm">{productName}</p>
      <input
        required
        placeholder="Ad Soyad"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        required
        placeholder="Telefon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="email"
        placeholder="E-posta (opsiyonel)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Notunuz (opsiyonel)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {error ? (
        <p className="text-sm" style={{ color: "#ffc4c0" }}>
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="text-sm" style={{ color: "#9dffc3" }}>
          {done}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Gönderiliyor…" : "Sipariş Talebi Gönder"}
      </button>
      <a
        href={whatsappUrl(
          `Merhaba, "${productName}" ürünü için bilgi / sipariş istiyorum.`
        )}
        className="btn btn-ghost w-full text-center"
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp {CONTACT_PHONE_DISPLAY}
      </a>
    </form>
  );
}
