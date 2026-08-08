"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Item = {
  id: string;
  providerServiceId: number;
  name: string;
  category: string;
  type: string;
  sellRate: number;
  min: number;
  max: number;
  dripfeed: boolean;
};

type Cat = { name: string; count: number };

export function NewOrderForm() {
  const [tab, setTab] = useState<"single" | "mass">("single");
  const [categories, setCategories] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(100);
  const [comments, setComments] = useState("");
  const [useDrip, setUseDrip] = useState(false);
  const [runs, setRuns] = useState(2);
  const [interval, setIntervalMin] = useState(10);
  const [mass, setMass] = useState("");
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
    const sp = new URLSearchParams({ category, pageSize: "150", page: "1" });
    fetch(`/api/smm/services?${sp}`)
      .then((r) => r.json())
      .then((d) => {
        const list: Item[] = d.items || [];
        setItems(list);
        if (list[0]) {
          setServiceId(list[0].id);
          setQty(list[0].min);
        } else setServiceId("");
      })
      .catch(() => null);
  }, [category]);

  const selected = useMemo(
    () => items.find((i) => i.id === serviceId) || null,
    [items, serviceId]
  );

  const billQty = useDrip && selected?.dripfeed ? runs * qty : qty;
  const charge = selected
    ? formatMoney(Math.round(((selected.sellRate * billQty) / 1000) * 100) / 100)
    : formatMoney(0);
  const isComments =
    selected?.type?.toLowerCase().includes("custom_comments") ||
    selected?.type?.toLowerCase() === "custom comments";

  async function submitSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/member/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selected.id,
        link,
        quantity: qty,
        comments: isComments ? comments : undefined,
        dripfeedRuns: useDrip && selected.dripfeed ? runs : undefined,
        dripfeedInterval: useDrip && selected.dripfeed ? interval : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Sipariş başarısız");
      return;
    }
    setMsg(`Sipariş alındı · #${data.order?.providerOrderId || data.order?.id}`);
    setLink("");
    setComments("");
  }

  async function submitMass(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/member/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: mass }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Toplu sipariş başarısız");
      return;
    }
    const ok = (data.results || []).filter((r: { ok: boolean }) => r.ok).length;
    const fail = (data.results || []).length - ok;
    setMsg(`Toplu sonuç: ${ok} başarılı, ${fail} hatalı`);
  }

  return (
    <div className="sp-card">
      <div className="sp-card-head">
        <h2>Yeni Sipariş</h2>
        <div className="sp-tabs">
          <button
            type="button"
            className={tab === "single" ? "is-active" : ""}
            onClick={() => setTab("single")}
          >
            Tekli Sipariş
          </button>
          <button
            type="button"
            className={tab === "mass" ? "is-active" : ""}
            onClick={() => setTab("mass")}
          >
            Toplu Sipariş
          </button>
        </div>
      </div>

      {tab === "single" ? (
        <form className="sp-form" onSubmit={submitSingle}>
          <label>
            <span>Kategori</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Servis</span>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                const s = items.find((i) => i.id === e.target.value);
                if (s) setQty(s.min);
                setUseDrip(false);
              }}
              required
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  ID{i.providerServiceId} - {i.name} - {formatMoney(i.sellRate)}
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <div className="sp-meta-row">
              <div>
                <span>Min</span>
                <strong>{selected.min.toLocaleString("tr-TR")}</strong>
              </div>
              <div>
                <span>Max</span>
                <strong>{selected.max.toLocaleString("tr-TR")}</strong>
              </div>
              <div>
                <span>Fiyat / 1000</span>
                <strong>{formatMoney(selected.sellRate)}</strong>
              </div>
            </div>
          ) : null}

          <label>
            <span>Link</span>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
              required
            />
          </label>

          {isComments ? (
            <label>
              <span>Yorumlar (satır başına 1)</span>
              <textarea
                rows={6}
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  const lines = e.target.value.split("\n").filter((x) => x.trim()).length;
                  if (lines > 0) setQty(lines);
                }}
                required
              />
            </label>
          ) : (
            <label>
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
          )}

          {selected?.dripfeed ? (
            <div className="sp-drip">
              <label className="sp-check">
                <input
                  type="checkbox"
                  checked={useDrip}
                  onChange={(e) => setUseDrip(e.target.checked)}
                />
                Drip-feed
              </label>
              {useDrip ? (
                <div className="sp-drip-fields">
                  <label>
                    <span>Runs</span>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      value={runs}
                      onChange={(e) => setRuns(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    <span>Interval (dk)</span>
                    <select
                      value={interval}
                      onChange={(e) => setIntervalMin(Number(e.target.value))}
                    >
                      {[10, 20, 30, 40, 50, 60].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="muted text-sm">Toplam adet: {billQty}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="sp-charge">
            Charge: <strong>{charge}</strong>
          </div>

          {err ? <p className="sp-err">{err}</p> : null}
          {msg ? <p className="sp-ok">{msg}</p> : null}

          <button type="submit" className="btn btn-primary" disabled={busy || !selected}>
            {busy ? "Gönderiliyor…" : "Siparişi Başlat"}
          </button>
        </form>
      ) : (
        <form className="sp-form" onSubmit={submitMass}>
          <p className="muted text-sm">
            Her satır: <code>servis_id|adet|link</code> — örn.{" "}
            <code>1234|1000|https://...</code> (provider servis ID)
          </p>
          <label>
            <span>Toplu sipariş listesi</span>
            <textarea
              rows={12}
              value={mass}
              onChange={(e) => setMass(e.target.value)}
              placeholder={"1234|1000|https://instagram.com/...\n5678|500|https://..."}
              required
            />
          </label>
          {err ? <p className="sp-err">{err}</p> : null}
          {msg ? <p className="sp-ok">{msg}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "İşleniyor…" : "Toplu Sipariş Ver"}
          </button>
        </form>
      )}
    </div>
  );
}
