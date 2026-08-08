"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

type Product = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  category: string;
  badge: string;
  icon: string;
  accent: string;
  accent2: string;
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
  category: string;
  badge: string;
  icon: string;
  accent: string;
  accent2: string;
  featuresText: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

const CATEGORY_OPTIONS = [
  { value: "hesap", label: "Eski Hesaplar" },
  { value: "kurtarma", label: "Kurtarma" },
  { value: "guvenlik", label: "Güvenlik" },
  { value: "itibar", label: "İtibar" },
  { value: "meta", label: "Meta" },
  { value: "sosyal", label: "Sosyal Medya" },
  { value: "dijital", label: "Dijital" },
];

const ICON_OPTIONS = [
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "x",
  "google",
  "whatsapp",
  "seo",
  "social",
  "ads",
  "design",
];

const EMPTY: EditForm = {
  name: "",
  slug: "",
  shortDesc: "",
  description: "",
  category: "sosyal",
  badge: "",
  icon: "social",
  accent: "#2ec4b6",
  accent2: "#7c5cff",
  featuresText: "WhatsApp destek\nHızlı yanıt",
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
    category: p.category,
    badge: p.badge,
    icon: p.icon,
    accent: p.accent || "#2ec4b6",
    accent2: p.accent2 || "#7c5cff",
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
    .replace(/ı/g, "i")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const STATUS_LABEL: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  closed: "Kapalı",
};

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (!res.ok) {
      setError("Admin girişi gerekli.");
      setLoading(false);
      return false;
    }
    const data = await res.json();
    setProducts(data.products || []);
    setLeads(data.leads || []);
    setError(null);
    setLoading(false);
    return true;
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin61";
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOkMsg(null);
    setError(null);
    const slug = (form.slug || slugify(form.name)).trim();
    const features = form.featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id,
        name: form.name.trim(),
        slug,
        shortDesc: form.shortDesc.trim(),
        description: form.description.trim() || form.shortDesc.trim(),
        category: form.category,
        badge: form.badge.trim(),
        icon: form.icon,
        accent: form.accent,
        accent2: form.accent2,
        featured: form.featured,
        active: form.active,
        sortOrder: Number(form.sortOrder) || 0,
        features,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Hizmet kaydedilemedi");
      return;
    }
    setOkMsg(form.id ? "Hizmet güncellendi." : "Yeni hizmet eklendi.");
    setForm(EMPTY);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Bu hizmet silinsin mi?")) return;
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Silinemedi");
      return;
    }
    if (form.id === id) setForm(EMPTY);
    setOkMsg("Hizmet silindi.");
    await load();
  }

  async function toggleActive(p: Product) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: p.id,
        slug: p.slug,
        name: p.name,
        shortDesc: p.shortDesc,
        description: p.description,
        category: p.category,
        badge: p.badge,
        icon: p.icon,
        accent: p.accent,
        accent2: p.accent2,
        features: parseFeatures(p.features),
        featured: p.featured,
        active: !p.active,
        sortOrder: p.sortOrder,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Durum güncellenemedi");
      return;
    }
    await load();
  }

  async function setLeadStatus(id: string, status: string) {
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      setError("Talep durumu güncellenemedi");
      return;
    }
    await load();
  }

  async function removeLead(id: string) {
    if (!confirm("Talep silinsin mi?")) return;
    await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <p className="muted">Yükleniyor…</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 space-y-3">
        <p>{error}</p>
        <p className="muted text-sm">
          Admin paneli Node sunucusunda çalışır (GitHub Pages üzerinde API yoktur).
        </p>
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
          <h1 className="display text-4xl font-bold">Hizmet Yönetimi</h1>
          <p className="muted">
            İsim, açıklama, özellikler, sıra — hepsini buradan düzenleyin. Destek:{" "}
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
          <Link href="/admin61" className="btn btn-ghost">
            Panel
          </Link>
          <Link href="/admin61/setup" className="btn btn-ghost">
            Meta kurulum
          </Link>
          <Link href="/urunler" className="btn btn-ghost">
            Siteyi aç
          </Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Çıkış
          </button>
        </div>
      </div>

      <form onSubmit={saveProduct} className="glass-panel rounded-2xl p-5 grid md:grid-cols-2 gap-3">
        <h2 className="display text-xl md:col-span-2">
          {form.id ? "Hizmeti düzenle" : "Yeni hizmet ekle"}
        </h2>
        <input
          placeholder="Hizmet adı"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
              slug: form.id ? form.slug : slugify(e.target.value),
            })
          }
          required
        />
        <input
          placeholder="Slug (URL)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <input
          placeholder="Kısa açıklama"
          value={form.shortDesc}
          onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
          className="md:col-span-2"
          required
        />
        <textarea
          placeholder="Uzun açıklama"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="md:col-span-2 min-h-24"
          rows={3}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          aria-label="Kategori"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          aria-label="İkon"
        >
          {ICON_OPTIONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        <input
          placeholder="Rozet (Popüler, Acil…)"
          value={form.badge}
          onChange={(e) => setForm({ ...form, badge: e.target.value })}
        />
        <input
          type="number"
          min={0}
          placeholder="Sıra (0 = en üst)"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
        <label className="text-sm muted">
          Renk 1
          <input
            type="color"
            value={form.accent}
            onChange={(e) => setForm({ ...form, accent: e.target.value })}
            className="mt-1 w-full h-10 p-1"
          />
        </label>
        <label className="text-sm muted">
          Renk 2
          <input
            type="color"
            value={form.accent2}
            onChange={(e) => setForm({ ...form, accent2: e.target.value })}
            className="mt-1 w-full h-10 p-1"
          />
        </label>
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
          Aktif (sitede görünür)
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
            {saving ? "Kaydediliyor…" : form.id ? "Güncelle" : "Hizmeti kaydet"}
          </button>
          {form.id ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setForm(EMPTY);
                setOkMsg(null);
                setError(null);
              }}
            >
              İptal / Yeni hizmet
            </button>
          ) : null}
        </div>
      </form>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="display text-2xl mb-4">Hizmetler ({products.length})</h2>
        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="muted text-sm">Henüz hizmet yok. Yukarıdan ekleyin.</p>
          ) : (
            products.map((p) => (
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
                    /{p.slug} · {p.category} · {p.active ? "aktif" : "pasif"}
                    {p.featured ? " · öne çıkan" : ""} · sıra {p.sortOrder}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-primary text-sm"
                    onClick={() => {
                      setForm(toForm(p));
                      setOkMsg(null);
                      setError(null);
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
            ))
          )}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="display text-2xl mb-4">Talepler ({leads.length})</h2>
        <div className="space-y-3">
          {leads.length === 0 ? (
            <p className="muted text-sm">Henüz talep yok.</p>
          ) : (
            leads.map((l) => (
              <div key={l.id} className="border-b border-white/10 pb-3 text-sm space-y-2">
                <p className="font-semibold">
                  {l.name} · {l.phone || "—"}
                </p>
                <p className="muted">
                  {l.product?.name || "Hizmet"} ·{" "}
                  {new Date(l.createdAt).toLocaleString("tr-TR")} ·{" "}
                  {STATUS_LABEL[l.status] || l.status}
                </p>
                {l.note ? <p>{l.note}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {l.phone ? (
                    <a
                      href={whatsappUrl(
                        `Merhaba ${l.name}, ${l.product?.name || "hizmet"} talebiniz hakkında yazıyorum.`
                      )}
                      className="btn btn-primary text-xs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  <select
                    className="text-sm"
                    value={l.status}
                    onChange={(e) => setLeadStatus(l.id, e.target.value)}
                    aria-label="Talep durumu"
                  >
                    <option value="new">Yeni</option>
                    <option value="contacted">İletişime geçildi</option>
                    <option value="closed">Kapalı</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost text-xs"
                    onClick={() => removeLead(l.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
