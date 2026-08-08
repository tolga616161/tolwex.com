"use client";

import { useEffect, useState } from "react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [action, setAction] = useState("");

  useEffect(() => {
    const sp = action ? `?action=${encodeURIComponent(action)}` : "";
    fetch(`/api/admin/logs${sp}`)
      .then((r) => (r.ok ? r.json() : { logs: [] }))
      .then((d) => setLogs(d.logs || []));
  }, [action]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Loglar</h2>
          <p className="muted">Sistem audit kayıtları</p>
        </div>
      </div>
      <div className="admin-toolbar">
        <input
          placeholder="Aksiyon filtresi (ör. smm.order)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Zaman</th>
              <th>Aksiyon</th>
              <th>Aktör</th>
              <th>Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={String(l.id)}>
                <td>{new Date(String(l.createdAt)).toLocaleString("tr-TR")}</td>
                <td>
                  <code>{String(l.action)}</code>
                </td>
                <td>
                  {String(l.actorType)}{" "}
                  {l.actorId ? `· ${String(l.actorId).slice(0, 8)}` : ""}
                </td>
                <td>
                  <code className="text-xs">{JSON.stringify(l.metadata)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
