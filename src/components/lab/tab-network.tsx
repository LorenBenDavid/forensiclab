"use client";
import type { NetworkLog } from "@/lib/scenes-data";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

export default function TabNetwork({ networkLog }: { networkLog: NetworkLog }) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-xs tracking-[0.3em]" style={{ color: "var(--text-dim)" }}>
          NETWORK FORENSICS // OUTBOUND CONNECTION ANALYSIS
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "TOTAL CONNECTIONS", value: networkLog.stats.total },
            { label: "SUSPICIOUS", value: networkLog.stats.suspicious },
            { label: "DATA EXFILTRATED", value: `${networkLog.stats.exfiltrated_mb} MB` },
          ].map((s) => (
            <div key={s.label} className="terminal-panel p-4 text-center">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: s.label === "SUSPICIOUS" ? "var(--red)" : "var(--green)" }}
              >
                {s.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Connections */}
        {networkLog.connections.length > 0 && (
          <div className="terminal-panel overflow-hidden">
            <div
              className="px-4 py-2 text-xs tracking-widest"
              style={{ borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}
            >
              OUTBOUND CONNECTIONS
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["DESTINATION IP", "PORT", "PROTO", "COUNTRY", "BYTES", "LABEL"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-normal" style={{ color: "var(--text-dim)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {networkLog.connections.map((conn, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid rgba(0,255,136,0.05)",
                        background: conn.suspicious ? "rgba(255,51,85,0.04)" : "transparent",
                      }}
                    >
                      <td className="px-4 py-2 font-mono" style={{ color: conn.suspicious ? "var(--red)" : "var(--text)" }}>
                        {conn.dst_ip}
                      </td>
                      <td className="px-4 py-2" style={{ color: "var(--text-dim)" }}>{conn.dst_port}</td>
                      <td className="px-4 py-2" style={{ color: "var(--cyan)" }}>{conn.protocol}</td>
                      <td className="px-4 py-2" style={{ color: "var(--text-dim)" }}>{conn.country}</td>
                      <td className="px-4 py-2" style={{ color: "var(--text)" }}>{formatBytes(conn.bytes)}</td>
                      <td className="px-4 py-2">
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            background: conn.suspicious ? "rgba(255,51,85,0.12)" : "rgba(0,255,136,0.08)",
                            color: conn.suspicious ? "var(--red)" : "var(--green)",
                            border: `1px solid ${conn.suspicious ? "rgba(255,51,85,0.3)" : "rgba(0,255,136,0.2)"}`,
                          }}
                        >
                          {conn.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DNS queries */}
        {networkLog.dns_queries.length > 0 && (
          <div className="terminal-panel overflow-hidden">
            <div
              className="px-4 py-2 text-xs tracking-widest"
              style={{ borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}
            >
              DNS QUERIES
            </div>
            <div className="p-4 space-y-2">
              {networkLog.dns_queries.map((q, i) => (
                <div key={i} className="flex items-center gap-4 text-xs">
                  <span className={q.suspicious ? "badge-high" : "badge-clean"} style={{ padding: "2px 6px", borderRadius: 2 }}>
                    {q.type}
                  </span>
                  <span
                    className="font-mono flex-1"
                    style={{ color: q.suspicious ? "var(--red)" : "var(--text-dim)" }}
                  >
                    {q.query}
                  </span>
                  {q.suspicious && (
                    <span style={{ color: "var(--red)" }}>⚠ SUSPICIOUS</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {networkLog.connections.length === 0 && networkLog.dns_queries.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--text-dim)" }}>
            No network activity recorded for this scene.
          </div>
        )}
      </div>
    </div>
  );
}
