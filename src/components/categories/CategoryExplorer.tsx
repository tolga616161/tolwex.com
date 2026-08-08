"use client";

import { useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  FILTERS,
  type CategoryFilter,
  type CategoryItem,
} from "@/lib/categories";
import { CategoryIcon } from "@/components/icons/CategoryIcons";

function CategoryCard({ item }: { item: CategoryItem }) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -10;
    const ry = ((x / rect.width) - 0.5) * 12;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <a
      ref={ref}
      href={item.href}
      className="category-card group"
      style={
        {
          "--accent": item.accent,
          "--accent2": item.accent2,
        } as React.CSSProperties
      }
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="category-card-inner">
        <div className="category-card-glow" />
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="category-icon-wrap">
            <CategoryIcon name={item.icon} className="size-8" />
          </div>
          {item.meta ? <span className="category-meta">{item.meta}</span> : null}
        </div>
        <h3 className="display text-2xl font-bold mb-1">{item.name}</h3>
        <p className="text-sm muted mb-3">{item.short}</p>
        <p className="category-desc">{item.description}</p>
        <span className="category-cta">Keşfet →</span>
      </div>
    </a>
  );
}

export function CategoryExplorer() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [animKey, setAnimKey] = useState(0);

  const items = useMemo(() => {
    if (filter === "all") return CATEGORIES;
    return CATEGORIES.filter((c) => c.filter.includes(filter));
  }, [filter]);

  function select(next: CategoryFilter) {
    setFilter(next);
    setAnimKey((k) => k + 1);
  }

  return (
    <section id="categories" className="relative py-6">
      <div className="category-bg" aria-hidden>
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="net-lines" />
        <span className="particles" />
        <span className="category-binary">01010101 · 11001010 · INSTAGRAM · TIKTOK · GOOGLE · 10101010</span>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] mb-2" style={{ color: "var(--accent)" }}>
              Hizmet kategorileri
            </p>
            <h2 className="display text-3xl md:text-5xl font-bold">Hizmetler</h2>
            <p className="muted mt-2 max-w-xl">
              Eski hesap, aktif etme, Meta Verified, güvenlik ve sosyal medya — keşfedin.
            </p>
          </div>
        </div>

        <div className="filter-bar" role="tablist" aria-label="Kategori filtreleri">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`filter-chip ${filter === f.id ? "is-active" : ""}`}
              onClick={() => select(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div key={animKey} className="category-grid">
          {items.map((item: CategoryItem, i) => (
            <div
              key={item.id}
              className="category-anim"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <CategoryCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
