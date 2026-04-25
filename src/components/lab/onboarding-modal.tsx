"use client";
import type { Scene } from "@/lib/scenes-data";

interface Props {
  scene: Scene;
  onStart: () => void;
}

export default function OnboardingModal({ scene, onStart }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(5,10,6,0.95)" }}
    >
      <div
        className="w-full max-w-xl terminal-panel p-8 relative"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--text-dim)" }}>
          BRIEFING // SCENE #{scene.id}
        </div>
        <div
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--green)" }}
        >
          {scene.title}
        </div>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(0,204,255,0.1)", color: "var(--cyan)", border: "1px solid rgba(0,204,255,0.2)" }}>
            {scene.category.toUpperCase()}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              scene.difficulty === "BEGINNER" ? "badge-clean" : scene.difficulty === "INTERMEDIATE" ? "badge-med" : "badge-high"
            }`}
          >
            {scene.difficulty}
          </span>
        </div>

        {/* Scenario */}
        <div
          className="text-sm leading-relaxed mb-6 p-4"
          style={{ background: "rgba(0,255,136,0.04)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          {scene.scenario}
        </div>

        {/* 5-step guide */}
        <div className="mb-6">
          <div className="text-xs tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
            INVESTIGATION PROTOCOL
          </div>
          <div className="space-y-2">
            {[
              "Click a file in the left panel to examine it",
              "Make guesses using the 4 buttons (EXT MISMATCH, KEYWORDS, TIMESTAMP, HASH)",
              "Hover the ? next to each button to understand what to look for",
              "Press AUTO SCAN when done — reveals what you missed",
              "Check the TIMELINE, NETWORK, and CUSTODY tabs for full context",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(0,255,136,0.12)",
                    border: "1px solid rgba(0,255,136,0.3)",
                    color: "var(--green)",
                    borderRadius: 2,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: "var(--text)" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6">
          <div className="text-xs tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
            RISK LEGEND
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "HIGH", className: "badge-high" },
              { label: "MED", className: "badge-med" },
              { label: "LOW", className: "badge-low" },
              { label: "CLEAN", className: "badge-clean" },
            ].map((b) => (
              <span key={b.label} className={`text-xs px-2 py-0.5 rounded ${b.className}`}>
                {b.label}
              </span>
            ))}
            <span className="text-xs" style={{ color: "var(--green)" }}>✓ correct guess</span>
            <span className="text-xs" style={{ color: "var(--red)" }}>✗ wrong guess</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-3 text-lg font-bold tracking-widest btn-autoscan transition-all"
          style={{
            fontFamily: "var(--font-display)",
            background: "var(--green)",
            color: "#050a06",
            border: "2px solid var(--green)",
            borderRadius: 3,
          }}
        >
          START INVESTIGATION
        </button>
      </div>
    </div>
  );
}
