"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatMoney } from "@/lib/money";
import {
  detectPlatform,
  filterCategoriesForPlatform,
  type PlatformId,
} from "@/lib/platforms";
import { PlatformPicker } from "@/components/smm/PlatformPicker";

type Item = {
  id: string;
  providerServiceId: number;
  name: string;
  description?: string;
  category: string;
  type: string;
  sellRate: number;
  min: number;
  max: number;
  dripfeed: boolean;
  refill?: boolean;
  cancel?: boolean;
};

type Cat = { name: string; count: number };

function normalizeLink(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function NewOrderForm() {
  const search = useSearchParams();
  const presetService = search.get("service") || search.get("sid") || "";

  const [tab, setTab] = useState<"single" | "mass">("single");
  const [categories, setCategories] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [platform, setPlatform] = useState<PlatformId | "">("");
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
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
  const [loadingServices, setLoadingServices] = useState(false);

  const visibleCats = useMemo(
    () => filterCategoriesForPlatform(categories, platform),
    [categories, platform]
  );

  useEffect(() => {
    fetch("/api/smm/services?pageSize=10&sync=1")
      .then((r) => r.json())
      .then((d) => {
        const cats: Cat[] = d.categories || [];
        setCategories(cats);
        if (!cats.length && d.syncError) setErr(`Servis sync: ${d.syncError}`);
        if (cats[0] && !category) {
          const firstIg = cats.find((c) => detectPlatform(c.name) === "ig");
          const pick = firstIg || cats[0];
          setPlatform(detectPlatform(pick.name));
          setCategory(pick.name);
        }
      })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visibleCats.length) {
      setCategory("");
      return;
    }
    if (!visibleCats.some((c) => c.name === category)) {
      setCategory(visibleCats[0].name);
    }
  }, [visibleCats, category]);

  useEffect(() => {
    if (!category) return;
    setLoadingServices(true);
    const sp = new URLSearchParams({ category, pageSize: "500", page: "1", sync: "1" });
    fetch(`/api/smm/services?${sp}`)
      .then((r) => r.json())
      .then((d) => {
        const list: Item[] = d.items || [];
        setItems(list);
        const preferred =
          (presetService &&
            list.find(
              (i) => i.id === presetService || String(i.providerServiceId) === presetService
            )) ||
          list[0];
        if (preferred) {
          setServiceId(preferred.id);
          setQty(preferred.min);
        } else setServiceId("");
      })
      .catch(() => null)
      .finally(() => setLoadingServices(false));
  }, [category, presetService]);

  const filtered = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        String(i.providerServiceId).includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [items, serviceQuery]);

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

  function pickService(id: string) {
    setServiceId(id);
    const s = items.find((i) => i.id === id);
    if (s) setQty(s.min);
    setUseDrip(false);
    setErr(null);
    setMsg(null);
  }

  function onPlatformChange(id: PlatformId | "") {
    setPlatform(id);
    setServiceQuery("");
  }

  async function submitSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/member/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          serviceId: selected.id,
          link: normalizeLink(link),
          quantity: qty,
          comments: isComments ? comments : undefined,
          dripfeedRuns: useDrip && selected.dripfeed ? runs : undefined,
          dripfeedInterval: useDrip && selected.dripfeed ? interval : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Sipariş başarısız");
        return;
      }
      setMsg(`Sipariş alındı · #${data.order?.providerOrderId || data.order?.id}`);
      setLink("");
      setComments("");
    } catch {
      setErr("Ağ hatası — tekrar deneyin");
    } finally {
      setBusy(false);
    }
  }

  async function submitMass(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/member/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ lines: mass }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Toplu sipariş başarısız");
        return;
      }
      const ok = (data.results || []).filter((r: { ok: boolean }) => r.ok).length;
      const fail = (data.results || []).length - ok;
      setMsg(`Toplu sonuç: ${ok} başarılı, ${fail} hatalı`);
    } catch {
      setErr("Ağ hatası — tekrar deneyin");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sp-order-layout">
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
            <PlatformPicker
              categories={categories}
              value={platform}
              onChange={onPlatformChange}
              showAll={false}
              label="1 · Platform seç"
            />

            <label>
              <span>2 · Kategori</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                {visibleCats.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Servis ara</span>
              <input
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="İsim veya ID ile filtrele…"
              />
            </label>

            <label>
              <span>3 · Servis</span>
              <select
                value={serviceId}
                onChange={(e) => pickService(e.target.value)}
                required
                disabled={loadingServices || !filtered.length}
              >
                {filtered.map((i) => (
                  <option key={i.id} value={i.id}>
                    ID{i.providerServiceId} — {i.name} — {formatMoney(i.sellRate)}
                  </option>
                ))}
              </select>
            </label>

            {selected ? (
              <>
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
                {selected.description ? (
                  <p className="muted text-sm" style={{ marginTop: "0.35rem" }}>
                    {selected.description}
                  </p>
                ) : null}
              </>
            ) : null}

            <label>
              <span>Link</span>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="instagram.com/kullanici veya https://"
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

      {tab === "single" ? (
        <div className="sp-card">
          <div className="sp-card-head">
            <h2>Servis listesi</h2>
            <span className="muted text-sm">
              {loadingServices ? "Yükleniyor…" : `${filtered.length} servis — tıkla seç`}
            </span>
          </div>
          <div className="sp-table-wrap sp-service-pick">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Servis</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Fiyat / 1000</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 80).map((i) => (
                  <tr
                    key={i.id}
                    className={i.id === serviceId ? "is-selected" : ""}
                    onClick={() => pickService(i.id)}
                  >
                    <td>{i.providerServiceId}</td>
                    <td>{i.name}</td>
                    <td>{i.min.toLocaleString("tr-TR")}</td>
                    <td>{i.max.toLocaleString("tr-TR")}</td>
                    <td>{formatMoney(i.sellRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loadingServices && filtered.length === 0 ? (
              <p className="muted p-4 text-sm">Bu kategoride servis yok.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
