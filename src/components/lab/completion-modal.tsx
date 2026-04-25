"use client";
import Link from "next/link";
import type { Scene, FindingKey } from "@/lib/scenes-data";

interface Props {
  score: number;
  maxScore: number;
  confirmedFindings: Map<FindingKey, boolean>;
  scene: Scene;
  nextSceneId?: string;
  onRetry: () => void;
  onClose: () => void;
}

export default function CompletionModal({ score, maxScore, confirmedFindings, scene, nextSceneId, onRetry }: Props) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const grade = pct === 100 ? "PERFECT" : pct >= 70 ? "GOOD" : pct >= 40 ? "PARTIAL" : "NEEDS WORK";
  const gradeColor = pct === 100 ? "var(--green)" : pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(5,10,6,0.92)" }}
    >
      <div className="w-full max-w-md terminal-panel p-8">
        <div className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--text-dim)" }}>
          INVESTIGATION COMPLETE
        </div>
        <div
          className="text-4xl font-bold mb-1"
          style={{ fontFamily: "var(--font-display)", color: gradeColor }}
        >
          {grade}
        </div>
        <div className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
          Scene #{scene.id} — {scene.title}
        </div>

        {/* Score */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold" style={{ fontFamily: "var(--font-display)", color: gradeColor }}>
              {score}
            </div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>of {maxScore} points</div>
          </div>
          <div className="flex-1">
            <div className="h-3 rounded overflow-hidden" style={{ background: "rgba(0,255,136,0.1)" }}>
              <div
                className="h-full transition-all"
                style={{ width: `${pct}%`, background: gradeColor }}
              />
            </div>
            <div className="text-xs mt-1 text-right" style={{ color: "var(--text-dim)" }}>{pct}%</div>
          </div>
        </div>

        {/* Findings breakdown */}
        <div className="mb-6 space-y-2">
          <div className="text-xs tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>FINDINGS</div>
          {scene.solution.findings.map((f) => {
            const found = confirmedFindings.get(f) === true;
            return (
              <div key={f} className="flex items-start gap-2 text-sm">
                <span style={{ color: found ? "var(--green)" : "var(--red)" }}>{found ? "✓" : "✗"}</span>
                <div>
                  <div className="font-bold" style={{ color: found ? "var(--green)" : "var(--red)", fontFamily: "var(--font-display)" }}>
                    {f.toUpperCase()} {found ? "(found by you)" : "(missed — auto scan found it)"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                    {scene.solution.explanations[f]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-2 text-sm font-bold tracking-widest transition-all hover:opacity-80"
            style={{
              fontFamily: "var(--font-display)",
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              borderRadius: 3,
            }}
          >
            RETRY
          </button>
          {nextSceneId ? (
            <Link href={`/lab/${nextSceneId}`} className="flex-1">
              <button
                className="w-full py-2 text-sm font-bold tracking-widest transition-all"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "var(--green)",
                  color: "#050a06",
                  border: "2px solid var(--green)",
                  borderRadius: 3,
                }}
              >
                NEXT SCENE →
              </button>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex-1">
              <button
                className="w-full py-2 text-sm font-bold tracking-widest transition-all"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "var(--green)",
                  color: "#050a06",
                  border: "2px solid var(--green)",
                  borderRadius: 3,
                }}
              >
                DASHBOARD →
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
