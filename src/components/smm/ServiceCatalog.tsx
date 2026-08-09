"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type Item = {
  id: string;
  providerServiceId: number;
  name: string;
  description?: string;
  category: string;
  sellRate: number;
  rate: number;
  min: number;
  max: number;
};

type Cat = { name: string; count: number };

export function ServiceCatalog({ memberMode = false }: { memberMode?: boolean }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const sp = new URLSearchParams({
        page: String(page),
        pageSize: "36",
        sync: page === 1 && !q && !category ? "1" : "0",
      });
      if (q.trim()) sp.set("q", q.trim());
      if (category) sp.set("category", category);
      const res = await fetch(`/api/smm/services?${sp}`);
      const data = await res.json();
      setItems(data.items || []);
      setCategories(data.categories || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [q, category, page]);

  const topCats = useMemo(() => categories.slice(0, 40), [categories]);

  return (
    <div className="smm-catalog">
      <div className="smm-toolbar">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Servis ara (Instagram, TikTok…)"
          aria-label="Ara"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          aria-label="Kategori"
        >
          <option value="">Tüm kategoriler ({total})</option>
          {topCats.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="muted">Servisler yükleniyor…</p> : null}

      <div className="smm-grid">
        {items.map((item) => (
          <article key={item.id} className="smm-card">
            <p className="smm-cat">{item.category}</p>
            <h3>{item.name}</h3>
            {item.description ? <p className="muted text-xs">{item.description}</p> : null}
            <div className="smm-meta">
              <span>#{item.providerServiceId}</span>
              <span>
                {item.min.toLocaleString("tr-TR")} – {item.max.toLocaleString("tr-TR")}
              </span>
            </div>
            <p className="smm-price">
              <strong>{formatMoney(item.sellRate)}</strong>
              <span>/ 1000</span>
            </p>
            {memberMode ? (
              <div className="flex flex-wrap gap-2">
                <Link href={`/uye?service=${item.id}`} className="btn btn-primary">
                  Seç / Sipariş
                </Link>
                <button type="button" className="btn btn-ghost" onClick={() => setSelected(item)}>
                  Hızlı
                </button>
              </div>
            ) : (
              <Link href="/uye/giris" className="btn btn-ghost">
                Üye girişi ile al
              </Link>
            )}
          </article>
        ))}
      </div>

      {!loading && !items.length ? (
        <p className="muted">Servis bulunamadı. Admin panelinden SMM sync çalıştırın.</p>
      ) : null}

      <div className="smm-pager">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Önceki
        </button>
        <span className="muted">
          {page} / {pages}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Sonraki
        </button>
      </div>

      {selected && memberMode ? (
        <OrderModal item={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function OrderModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(item.min);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const estimate = formatMoney(Math.round(((item.sellRate * qty) / 1000) * 100) / 100);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/member/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: item.id, link, quantity: qty }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Sipariş başarısız");
      return;
    }
    setMsg(`Sipariş alındı · #${data.order?.providerOrderId || data.order?.id}`);
  }

  return (
    <div className="smm-modal" role="dialog" aria-modal>
      <form className="smm-modal-card" onSubmit={submit}>
        <h3 className="display text-xl">Sipariş</h3>
        <p className="muted text-sm">{item.name}</p>
        <label>
          Link
          <input
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </label>
        <label>
          Adet ({item.min} – {item.max})
          <input
            type="number"
            required
            min={item.min}
            max={item.max}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </label>
        <p className="smm-price">
          Tahmini tutar: <strong>{estimate}</strong>
        </p>
        {msg ? <p className="muted text-sm">{msg}</p> : null}
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Gönderiliyor…" : "Onayla"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Kapat
          </button>
        </div>
      </form>
    </div>
  );
}
