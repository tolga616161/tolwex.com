type Props = {
  title: string;
  label: string;
  status: "active" | "inactive" | "warn" | "error" | "idle" | "unavailable" | "ok";
};

const map: Record<string, { cls: string; prefix: string }> = {
  active: { cls: "status-ok", prefix: "" },
  ok: { cls: "status-ok", prefix: "" },
  inactive: { cls: "status-bad", prefix: "" },
  error: { cls: "status-bad", prefix: "" },
  warn: { cls: "status-warn", prefix: "" },
  idle: { cls: "status-idle", prefix: "" },
  unavailable: { cls: "status-idle", prefix: "" },
};

export function StatusCard({ title, label, status }: Props) {
  const m = map[status] || map.idle;
  return (
    <div className="surface rounded-2xl p-5 h-full">
      <p className="text-xs uppercase tracking-[0.14em] muted mb-3">{title}</p>
      <div className="flex items-center gap-3">
        <span className={`status-dot ${m.cls}`} />
        <p className="font-medium leading-snug">{label}</p>
      </div>
    </div>
  );
}
