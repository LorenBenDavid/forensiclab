"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden flex flex-col items-center justify-center px-4">
      <div className="scanlines absolute inset-0 pointer-events-none" />

      <div className="relative z-10 text-center mb-12">
        <div className="text-xs tracking-[0.3em] mb-3" style={{ color: "var(--text-dim)" }}>
          FORENSICLAB // DIGITAL FORENSICS TRAINING
        </div>
        <h1
          className="text-6xl md:text-8xl font-bold tracking-tight mb-4 glow-green"
          style={{ fontFamily: "var(--font-display)", color: "var(--green)" }}
        >
          FORENSICLAB
        </h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto" style={{ color: "var(--text-dim)" }}>
          Investigate simulated crime scenes. Build real digital forensics skills.
        </p>
      </div>

      <div className="relative z-10 flex gap-8 mb-10 text-center">
        {[
          { n: "20+", label: "CRIME SCENES" },
          { n: "4", label: "ATTACK CATEGORIES" },
          { n: "3", label: "DIFFICULTY LEVELS" },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-bold glow-green" style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}>
              {s.n}
            </div>
            <div className="text-xs tracking-widest mt-1" style={{ color: "var(--text-dim)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center">
        {session ? (
          <Link
            href="/dashboard"
            className="px-8 py-3 text-lg font-bold tracking-widest transition-all"
            style={{ fontFamily: "var(--font-display)", background: "var(--green)", color: "#050a06", border: "2px solid var(--green)" }}
          >
            OPEN DASHBOARD
          </Link>
        ) : (
          <>
            <Link
              href="/lab/01"
              className="px-8 py-3 text-lg font-bold tracking-widest transition-all btn-autoscan"
              style={{ fontFamily: "var(--font-display)", background: "var(--green)", color: "#050a06", border: "2px solid var(--green)" }}
            >
              TRY FREE SCENE
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 text-lg font-bold tracking-widest transition-all hover:opacity-80"
              style={{ fontFamily: "var(--font-display)", background: "transparent", color: "var(--green)", border: "2px solid var(--green)" }}
            >
              LOGIN TO SAVE PROGRESS
            </Link>
          </>
        )}
      </div>

      <div className="relative z-10 mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
        {[
          { icon: "🔍", label: "File Analysis", desc: "Magic bytes, keywords, timestamps" },
          { icon: "🌐", label: "Network Forensics", desc: "C2 beacons, exfil, DNS tunneling" },
          { icon: "⏱️", label: "Timeline Recon", desc: "Reconstruct attack sequences" },
          { icon: "📋", label: "Chain of Custody", desc: "Document your findings" },
        ].map((f) => (
          <div key={f.label} className="terminal-panel p-4 text-center">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-sm font-bold mb-1" style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}>
              {f.label}
            </div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-4 text-xs" style={{ color: "var(--text-dim)" }}>
        [SYS] FORENSICLAB v1.0 // ONLINE
      </div>
      <div className="absolute top-4 right-4 text-xs" style={{ color: "var(--text-dim)" }}>
        {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
      </div>
      <div className="absolute bottom-4 left-4 text-xs" style={{ color: "var(--text-dim)" }}>
        STATUS: READY
      </div>
    </div>
  );
}
