"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  author: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  author: "TOLWEX",
  published: true,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setPosts(data.posts || []);
      else setMsg(data.error || "Yazılar yüklenemedi");
    } catch {
      setMsg("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(p: Post) {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      tags: p.tags.join(", "),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      author: p.author,
      published: p.published,
    });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm(EMPTY);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const body = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      author: form.author,
      published: form.published,
    };
    try {
      const res = await fetch(editId ? `/api/admin/blog/${editId}` : "/api/admin/blog", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || "Kayıt başarısız");
        return;
      }
      setMsg(editId ? "Yazı güncellendi" : "Yazı oluşturuldu — sitede /blog altında");
      resetForm();
      await load();
    } catch {
      setMsg("Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Bu yazı silinsin mi?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(data.error || "Silinemedi");
        return;
      }
      if (editId === id) resetForm();
      setMsg("Yazı silindi");
      await load();
    } catch {
      setMsg("Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Blog</h2>
          <p className="muted">
            SEO uyumlu yazı ekleyin / düzenleyin. Canlı:{" "}
            <Link href="/blog" target="_blank">
              /blog
            </Link>
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => void load()} disabled={loading}>
          {loading ? "Yükleniyor…" : "Yenile"}
        </button>
      </div>

      <form onSubmit={save} className="admin-panel grid gap-3 mb-6">
        <h3 className="text-sm font-semibold">{editId ? "Yazıyı düzenle" : "Yeni yazı"}</h3>
        <label className="grid gap-1">
          <span className="muted text-xs">Başlık *</span>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Örn: Instagram takipçi nasıl artırılır?"
          />
        </label>
        <label className="grid gap-1">
          <span className="muted text-xs">Slug (URL)</span>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="Boş bırakırsanız başlıktan üretilir"
          />
        </label>
        <label className="grid gap-1">
          <span className="muted text-xs">Özet (excerpt)</span>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            maxLength={320}
          />
        </label>
        <label className="grid gap-1">
          <span className="muted text-xs">İçerik (Markdown: ## başlık, - liste, **kalın**, [link](/yol))</span>
          <textarea
            rows={14}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="font-mono text-sm"
            required
          />
        </label>
        <div className="admin-two-col">
          <label className="grid gap-1">
            <span className="muted text-xs">SEO başlık (max 70)</span>
            <input
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              maxLength={70}
            />
          </label>
          <label className="grid gap-1">
            <span className="muted text-xs">Etiketler (virgülle)</span>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Instagram, takipçi, SMM"
            />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="muted text-xs">SEO açıklama (max 160)</span>
          <textarea
            rows={2}
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            maxLength={160}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Yayınla (sitede görünsün)
        </label>
        {msg ? <p className="admin-msg">{msg}</p> : null}
        <div className="admin-btn-row" style={{ marginTop: 0 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {editId ? "Güncelle" : "Yazıyı kaydet"}
          </button>
          {editId ? (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              İptal
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-panel">
        <h3 className="text-sm font-semibold mb-3">Tüm yazılar ({posts.length})</h3>
        {loading ? (
          <p className="muted">Yükleniyor…</p>
        ) : posts.length === 0 ? (
          <p className="muted">Henüz yazı yok — seed ilk açılışta yüklenecek.</p>
        ) : (
          <ul className="admin-usage-list">
            {posts.map((p) => (
              <li key={p.id}>
                <span>
                  {p.published ? "●" : "○"} {p.title}
                  <br />
                  <span className="muted text-xs">/blog/{p.slug}</span>
                </span>
                <span className="admin-btn-row" style={{ marginTop: 0 }}>
                  <Link href={`/blog/${p.slug}`} className="btn btn-ghost" target="_blank">
                    Gör
                  </Link>
                  <button type="button" className="btn btn-ghost" onClick={() => startEdit(p)}>
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => void remove(p.id)}
                  >
                    Sil
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
