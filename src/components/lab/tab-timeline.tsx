"use client";
import type { TimelineNode } from "@/lib/scenes-data";

const SEV_COLOR: Record<string, string> = {
  HIGH: "var(--red)",
  MED: "var(--amber)",
  LOW: "var(--cyan)",
  CLEAN: "var(--green)",
};

export default function TabTimeline({ timeline }: { timeline: TimelineNode[] }) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="text-xs tracking-[0.3em] mb-6" style={{ color: "var(--text-dim)" }}>
          ATTACK TIMELINE // CHRONOLOGICAL RECONSTRUCTION
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-20 top-0 bottom-0 w-px"
            style={{ background: "var(--border)" }}
          />
          <div className="space-y-6">
            {timeline.map((node, i) => (
              <div key={i} className="flex items-start gap-4">
                {/* Time */}
                <div
                  className="w-16 text-right text-xs flex-shrink-0 pt-0.5"
                  style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
                >
                  {node.time}
                </div>
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0 mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: SEV_COLOR[node.severity],
                      boxShadow: `0 0 8px ${SEV_COLOR[node.severity]}`,
                    }}
                  />
                </div>
                {/* Content */}
                <div className="flex-1 pb-2">
                  <div
                    className="text-sm font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)", color: SEV_COLOR[node.severity] }}
                  >
                    {node.event}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                    {node.detail}
                  </div>
                  <div
                    className="inline-block text-xs px-1.5 py-0.5 mt-1 rounded"
                    style={{
                      background: `rgba(${node.severity === "HIGH" ? "255,51,85" : node.severity === "MED" ? "255,170,0" : "0,204,255"},0.1)`,
                      color: SEV_COLOR[node.severity],
                      border: `1px solid ${SEV_COLOR[node.severity]}33`,
                    }}
                  >
                    {node.severity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
