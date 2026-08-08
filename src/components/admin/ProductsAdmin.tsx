"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

type Product = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  price: number;
  category: string;
  badge: string;
  icon: string;
  features: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
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

type EditForm = {
  id?: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  price: number;
  category: string;
  badge: string;
  icon: string;
  featuresText: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

const EMPTY: EditForm = {
  name: "",
  slug: "",
  shortDesc: "",
  description: "",
  price: 999,
  category: "dijital",
  badge: "",
  icon: "social",
  featuresText: "Hızlı teslim\nDestek",
  featured: true,
  active: true,
  sortOrder: 0,
};

function parseFeatures(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function toForm(p: Product): EditForm {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDesc: p.shortDesc,
    description: p.description,
    price: p.price,
    category: p.category,
    badge: p.badge,
    icon: p.icon,
    featuresText: parseFeatures(p.features).join("\n"),
    featured: p.featured,
    active: p.active,
    sortOrder: p.sortOrder,
  };
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9ğüşöçı\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/ı/g, "i");
}

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY);
  const [saving, setSaving] = useState(false);

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

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOkMsg(null);
    setError(null);
    const slug = form.slug || slugify(form.name);
    const features = form.featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        slug,
        shortDesc: form.shortDesc,
        description: form.description || form.shortDesc,
        price: Number(form.price),
        category: form.category,
        badge: form.badge,
        icon: form.icon,
        featured: form.featured,
        active: form.active,
        sortOrder: Number(form.sortOrder) || 0,
        features,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ürün kaydedilemedi");
      return;
    }
    setOkMsg(form.id ? "Ürün güncellendi." : "Yeni ürün eklendi.");
    setForm(EMPTY);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Ürün silinsin mi?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    if (form.id === id) setForm(EMPTY);
    await load();
  }

  async function toggleActive(p: Product) {
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: p.id,
        slug: p.slug,
        name: p.name,
        shortDesc: p.shortDesc,
        description: p.description,
        price: p.price,
        category: p.category,
        badge: p.badge,
        icon: p.icon,
        features: parseFeatures(p.features),
        featured: p.featured,
        active: !p.active,
        sortOrder: p.sortOrder,
      }),
    });
    await load();
  }

  if (error && products.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <p className="mb-3">{error}</p>
        <Link href="/admin61" className="btn btn-primary">
          Admin girişine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="display text-4xl font-bold">Ürün & Fiyat Yönetimi</h1>
          <p className="muted">
            İsim, fiyat, açıklama, özellikler — hepsini buradan düzenle. Destek:{" "}
            <a
              href={whatsappUrl()}
              className="underline"
              style={{ color: "var(--accent)" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin61/setup" className="btn btn-ghost">
            Meta kurulum
          </Link>
          <Link href="/urunler" className="btn btn-ghost">
            Mağazayı aç
          </Link>
        </div>
      </div>

      <form onSubmit={saveProduct} className="glass-panel rounded-2xl p-5 grid md:grid-cols-2 gap-3">
        <h2 className="display text-xl md:col-span-2">
          {form.id ? "Ürünü düzenle" : "Yeni ürün ekle"}
        </h2>
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
          className="md:col-span-2"
        />
        <textarea
          placeholder="Uzun açıklama"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="md:col-span-2 min-h-24"
          rows={3}
        />
        <input
          type="number"
          placeholder="Fiyat (TRY)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
        />
        <input
          placeholder="Kategori (itibar, instagram…)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          placeholder="Rozet (Popüler, Hızlı…)"
          value={form.badge}
          onChange={(e) => setForm({ ...form, badge: e.target.value })}
        />
        <input
          placeholder="İkon (instagram, seo, social…)"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
        />
        <input
          type="number"
          placeholder="Sıra (0 = en üst)"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
        <textarea
          placeholder="Özellikler (her satır bir madde)"
          value={form.featuresText}
          onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
          className="md:col-span-2 min-h-24"
          rows={4}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Ana sayfada öne çıkar
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Aktif (satışta)
        </label>
        {error ? (
          <p className="md:col-span-2 text-sm" style={{ color: "#ffc4c0" }}>
            {error}
          </p>
        ) : null}
        {okMsg ? (
          <p className="md:col-span-2 text-sm" style={{ color: "#9dffc3" }}>
            {okMsg}
          </p>
        ) : null}
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Kaydediliyor…" : form.id ? "Güncelle" : "Ürünü kaydet"}
          </button>
          {form.id ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setForm(EMPTY);
                setOkMsg(null);
              }}
            >
              İptal / Yeni ürün
            </button>
          ) : null}
        </div>
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
                <p className="font-semibold">
                  {p.name}{" "}
                  {p.badge ? (
                    <span className="muted text-xs">· {p.badge}</span>
                  ) : null}
                </p>
                <p className="muted text-sm">
                  {p.price} TRY · {p.category} · {p.active ? "aktif" : "pasif"}
                  {p.featured ? " · öne çıkan" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary text-sm"
                  onClick={() => {
                    setForm(toForm(p));
                    setOkMsg(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-sm"
                  onClick={() => toggleActive(p)}
                >
                  {p.active ? "Pasifleştir" : "Aktifleştir"}
                </button>
                <Link href={`/urunler/${p.slug}`} className="btn btn-ghost text-sm">
                  Gör
                </Link>
                <button
                  type="button"
                  className="btn btn-danger text-sm"
                  onClick={() => remove(p.id)}
                >
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
                  {l.product?.name || "Ürün"} ·{" "}
                  {new Date(l.createdAt).toLocaleString("tr-TR")}
                </p>
                {l.note ? <p>{l.note}</p> : null}
                {l.phone ? (
                  <a
                    href={whatsappUrl(
                      `Merhaba ${l.name}, ${l.product?.name || "sipariş"} talebiniz hakkında yazıyorum.`
                    )}
                    className="underline text-xs"
                    style={{ color: "var(--accent)" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp ile yaz
                  </a>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
