"use client";
import { useState } from "react";

interface CustodyEntry {
  time: string;
  finding: string;
  file: string;
  score: number;
}

interface Props {
  log: CustodyEntry[];
  onAddManual: (entry: CustodyEntry) => void;
}

export default function TabCustody({ log, onAddManual }: Props) {
  const [manualNote, setManualNote] = useState("");

  const handleAdd = () => {
    if (!manualNote.trim()) return;
    onAddManual({
      time: new Date().toISOString().slice(11, 19),
      finding: manualNote,
      file: "Manual Entry",
      score: 0,
    });
    setManualNote("");
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="text-xs tracking-[0.3em] mb-6" style={{ color: "var(--text-dim)" }}>
          CHAIN OF CUSTODY // EVIDENCE LOG
        </div>

        {/* Log table */}
        <div className="terminal-panel overflow-hidden mb-6">
          <div
            className="px-4 py-2 text-xs tracking-widest flex justify-between"
            style={{ borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}
          >
            <span>EVIDENCE LOG</span>
            <span>{log.length} entries</span>
          </div>
          {log.length === 0 ? (
            <div className="p-8 text-center text-xs" style={{ color: "var(--text-dim)" }}>
              No findings logged yet. Make correct guesses to auto-log evidence.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(0,255,136,0.05)" }}>
              {log.map((entry, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-4">
                  <div className="text-xs font-mono flex-shrink-0 pt-0.5" style={{ color: "var(--text-dim)" }}>
                    {String(i + 1).padStart(3, "0")}
                  </div>
                  <div className="text-xs font-mono flex-shrink-0 pt-0.5" style={{ color: "var(--text-dim)" }}>
                    {entry.time}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}>
                      {entry.finding}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                      File: {entry.file}
                    </div>
                  </div>
                  {entry.score > 0 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: "rgba(0,255,136,0.1)", color: "var(--green)", border: "1px solid rgba(0,255,136,0.2)" }}
                    >
                      +{entry.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual entry */}
        <div className="terminal-panel p-4">
          <div className="text-xs tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
            ADD MANUAL NOTE
          </div>
          <div className="flex gap-2">
            <input
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Describe an observation..."
              className="flex-1 bg-transparent outline-none text-sm px-3 py-2"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
              }}
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-xs font-bold tracking-widest transition-all hover:opacity-80"
              style={{
                fontFamily: "var(--font-display)",
                background: "rgba(0,255,136,0.08)",
                border: "1px solid var(--border)",
                color: "var(--green)",
              }}
            >
              ADD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
