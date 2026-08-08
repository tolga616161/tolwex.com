"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  category: string;
  badge: string;
  featured: boolean;
  active: boolean;
};

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  status: string;
  createdAt: string;
  product?: { name: string; slug: string } | null;
};

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortDesc: "",
    price: 999,
    category: "dijital",
    badge: "",
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/products")
      .then(async (res) => {
        if (!res.ok) throw new Error("Admin girişi gerekli.");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products || []);
        setLeads(data.leads || []);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Admin girişi gerekli.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function load() {
    const res = await fetch("/api/admin/products");
    if (!res.ok) {
      setError("Admin girişi gerekli.");
      return;
    }
    const data = await res.json();
    setProducts(data.products || []);
    setLeads(data.leads || []);
    setError(null);
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    const slug =
      form.slug ||
      form.name
        .toLowerCase()
        .replace(/[^a-z0-9ğüşöçı\s-]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/ı/g, "i");

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug,
        shortDesc: form.shortDesc,
        description: form.shortDesc,
        price: Number(form.price),
        category: form.category,
        badge: form.badge,
        featured: true,
        active: true,
        features: ["Hızlı teslim", "Destek"],
        icon: "social",
      }),
    });
    if (!res.ok) {
      setError("Ürün kaydedilemedi");
      return;
    }
    setForm({ name: "", slug: "", shortDesc: "", price: 999, category: "dijital", badge: "" });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Ürün silinsin mi?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    await load();
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <p className="mb-3">{error}</p>
        <Link href="/admin" className="btn btn-primary">
          Admin girişine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="display text-4xl font-bold">Ürün Yönetimi</h1>
          <p className="muted">Ürün ekle, sil; sipariş taleplerini gör.</p>
        </div>
        <Link href="/urunler" className="btn btn-ghost">
          Mağazayı aç
        </Link>
      </div>

      <form onSubmit={createProduct} className="glass-panel rounded-2xl p-5 grid md:grid-cols-2 gap-3">
        <h2 className="display text-xl md:col-span-2">Yeni ürün</h2>
        <input
          placeholder="Ürün adı"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Slug (opsiyonel)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <input
          placeholder="Kısa açıklama"
          value={form.shortDesc}
          onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
        />
        <input
          type="number"
          placeholder="Fiyat"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
        />
        <input
          placeholder="Kategori"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          placeholder="Rozet (Popüler, Yeni...)"
          value={form.badge}
          onChange={(e) => setForm({ ...form, badge: e.target.value })}
        />
        <button type="submit" className="btn btn-primary md:col-span-2">
          Ürünü kaydet
        </button>
      </form>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="display text-2xl mb-4">Ürünler ({products.length})</h2>
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-white/10 pb-3"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="muted text-sm">
                  {p.price} TRY · {p.category} · {p.active ? "aktif" : "pasif"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/urunler/${p.slug}`} className="btn btn-ghost text-sm">
                  Gör
                </Link>
                <button type="button" className="btn btn-danger text-sm" onClick={() => remove(p.id)}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="display text-2xl mb-4">Sipariş talepleri ({leads.length})</h2>
        <div className="space-y-3">
          {leads.length === 0 ? (
            <p className="muted text-sm">Henüz talep yok.</p>
          ) : (
            leads.map((l) => (
              <div key={l.id} className="border-b border-white/10 pb-3 text-sm">
                <p className="font-semibold">
                  {l.name} · {l.phone}
                </p>
                <p className="muted">
                  {l.product?.name || "Ürün"} · {new Date(l.createdAt).toLocaleString("tr-TR")}
                </p>
                {l.note ? <p>{l.note}</p> : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
