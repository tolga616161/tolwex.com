"use client";

import { platformTotals, type CatCount, type PlatformId } from "@/lib/platforms";

type Props = {
  categories: CatCount[];
  value: PlatformId | "";
  onChange: (id: PlatformId | "") => void;
  /** Show "Tümü" chip */
  showAll?: boolean;
  label?: string;
};

export function PlatformPicker({
  categories,
  value,
  onChange,
  showAll = true,
  label = "Platform",
}: Props) {
  const rows = platformTotals(categories);
  if (!rows.length) return null;

  return (
    <div className="platform-picker">
      <div className="platform-picker-head">
        <span>{label}</span>
        {showAll && value ? (
          <button type="button" className="platform-clear" onClick={() => onChange("")}>
            Temizle
          </button>
        ) : null}
      </div>
      <div className="platform-picker-grid" role="listbox" aria-label={label}>
        {showAll ? (
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            className={`platform-chip ${value === "" ? "is-active" : ""}`}
            onClick={() => onChange("")}
          >
            <span className="platform-chip-all">Tümü</span>
            <span className="platform-chip-name">Tüm platformlar</span>
            <span className="platform-chip-count">
              {categories.reduce((s, c) => s + c.count, 0)}
            </span>
          </button>
        ) : null}
        {rows.map((p) => (
          <button
            type="button"
            key={p.id}
            role="option"
            aria-selected={value === p.id}
            className={`platform-chip ${value === p.id ? "is-active" : ""}`}
            onClick={() => onChange(p.id)}
            title={p.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" width={36} height={36} className="platform-chip-img" />
            <span className="platform-chip-name">{p.name}</span>
            <span className="platform-chip-count">{p.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
