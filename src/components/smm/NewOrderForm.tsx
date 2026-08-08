"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  providerServiceId: number;
  name: string;
  category: string;
  sellRate: number;
  min: number;
  max: number;
};

type Cat = { name: string; count: number };

export function NewOrderForm() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(100);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/smm/services?pageSize=1")
      .then((r) => r.json())
      .then((d) => {
        const cats: Cat[] = d.categories || [];
        setCategories(cats);
        if (cats[0] && !category) setCategory(cats[0].name);
      })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!category) return;
    const sp = new URLSearchParams({ category, pageSize: "100", page: "1" });
    fetch(`/api/smm/services?${sp}`)
      .then((r) => r.json())
      .then((d) => {
        const list: Item[] = d.items || [];
        setItems(list);
        if (list[0]) {
          setServiceId(list[0].id);
          setQty(list[0].min);
        } else {
          setServiceId("");
        }
      })
      .catch(() => null);
  }, [category]);

  const selected = useMemo(
    () => items.find((i) => i.id === serviceId) || null,
    [items, serviceId]
  );

  const charge = selected ? ((selected.sellRate * qty) / 1000).toFixed(2) : "0.00";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/member/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: selected.id, link, quantity: qty }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Sipariş başarısız");
      return;
    }
    setMsg(`Sipariş alındı · #${data.order?.providerOrderId || data.order?.id}`);
    setLink("");
  }

  return (
    <form className="panel-order-form glass-panel rounded-2xl p-5 md:p-6" onSubmit={submit}>
      <h2 className="display text-2xl mb-1">Yeni sipariş</h2>
      <p className="muted text-sm mb-5">
        Kategori → servis seç → link ve adet gir (smmapi panel akışı).
      </p>

      <label className="recovery-field mb-3">
        <span>Kategori</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </label>

      <label className="recovery-field mb-3">
        <span>Servis</span>
        <select
          value={serviceId}
          onChange={(e) => {
            setServiceId(e.target.value);
            const s = items.find((i) => i.id === e.target.value);
            if (s) setQty(s.min);
          }}
          required
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              #{i.providerServiceId} · {i.name} · {i.sellRate.toFixed(2)} ₺/1K
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <p className="muted text-sm mb-3">
          Min {selected.min.toLocaleString("tr-TR")} · Max{" "}
          {selected.max.toLocaleString("tr-TR")} · {selected.sellRate.toFixed(2)} ₺ / 1000
        </p>
      ) : null}

      <label className="recovery-field mb-3">
        <span>Link</span>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://instagram.com/..."
          required
        />
      </label>

      <label className="recovery-field mb-3">
        <span>Adet</span>
        <input
          type="number"
          value={qty}
          min={selected?.min || 1}
          max={selected?.max || 1000000}
          onChange={(e) => setQty(Number(e.target.value))}
          required
        />
      </label>

      <p className="smm-price mb-4">
        Tahmini tutar: <strong>{charge} ₺</strong>
      </p>

      {err ? <p style={{ color: "#ff8a8a" }} className="text-sm mb-3">{err}</p> : null}
      {msg ? <p className="text-sm mb-3" style={{ color: "#9fdfb0" }}>{msg}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={busy || !selected}>
        {busy ? "Gönderiliyor…" : "Siparişi başlat"}
      </button>
    </form>
  );
}
