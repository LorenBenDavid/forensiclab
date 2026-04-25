"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Scene, SceneFile, FindingKey } from "@/lib/scenes-data";
import { SCENES } from "@/lib/scenes-data";
import OnboardingModal from "./onboarding-modal";
import CompletionModal from "./completion-modal";
import TabTimeline from "./tab-timeline";
import TabNetwork from "./tab-network";
import TabCustody from "./tab-custody";

const GUESS_BUTTONS: { key: FindingKey; label: string; tip: string }[] = [
  { key: "ext", label: "EXT MISMATCH", tip: "File magic bytes don't match the declared extension — the file is disguised as something else." },
  { key: "kw", label: "SUSPICIOUS KEYWORDS", tip: "Dangerous commands or strings found inside the file content — like shell commands, C2 addresses, or malware signatures." },
  { key: "ts", label: "TIMESTAMP ANOMALY", tip: "File was created or modified at an unusual hour — often a sign of automated attacker activity off-hours." },
  { key: "hash", label: "HASH MATCH", tip: "The file's SHA-256 fingerprint matches a known malware signature in the threat intelligence database." },
];

const RISK_COLOR: Record<string, string> = {
  HIGH: "var(--red)",
  MED: "var(--amber)",
  LOW: "var(--cyan)",
  CLEAN: "var(--green)",
};

type Tab = "analysis" | "timeline" | "network" | "custody";

interface CustodyEntry {
  time: string;
  finding: string;
  file: string;
  score: number;
}

interface Props {
  scene: Scene;
  userId: string | null;
}

export default function LabClient({ scene, userId }: Props) {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("analysis");
  const [selectedFile, setSelectedFile] = useState<SceneFile>(scene.files[0]);
  const [guesses, setGuesses] = useState<Set<FindingKey>>(new Set());
  const [confirmedFindings, setConfirmedFindings] = useState<Map<FindingKey, boolean>>(new Map());
  const [terminalLines, setTerminalLines] = useState<{ text: string; color?: string }[]>([
    { text: "> FORENSICLAB v1.0 // READY", color: "var(--green)" },
    { text: "> Type 'scan' to analyze, 'new' to get new scene, 'help' for commands.", color: "var(--text-dim)" },
  ]);
  const [cmdInput, setCmdInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [autoScanned, setAutoScanned] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore] = useState(scene.solution.findings.length);
  const [custodyLog, setCustodyLog] = useState<CustodyEntry[]>([]);
  const [startTime] = useState(Date.now());
  const [showCompletion, setShowCompletion] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const addTerminalLines = useCallback((lines: { text: string; color?: string }[], delay = 120) => {
    lines.forEach((line, i) => {
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, line]);
      }, i * delay);
    });
  }, []);

  const runScan = useCallback(
    (file: SceneFile) => {
      if (isScanning) return;
      setIsScanning(true);
      const lines = [
        { text: `> scan ${file.name}`, color: "var(--green)" },
        ...file.terminal_lines.map((l) => {
          const color = l.startsWith("[!]")
            ? "var(--red)"
            : l.startsWith("[+]")
            ? "var(--green)"
            : l.startsWith("[*]")
            ? "var(--cyan)"
            : "var(--text)";
          return { text: l, color };
        }),
      ];
      addTerminalLines(lines, 140);
      setTimeout(() => setIsScanning(false), lines.length * 140 + 200);
    },
    [isScanning, addTerminalLines]
  );

  const handleGuess = (key: FindingKey) => {
    if (autoScanned || confirmedFindings.has(key)) return;
    const correct = scene.solution.findings.includes(key);
    const newGuesses = new Set(guesses);
    newGuesses.add(key);
    setGuesses(newGuesses);

    const newConfirmed = new Map(confirmedFindings);
    newConfirmed.set(key, correct);
    setConfirmedFindings(newConfirmed);

    if (correct) {
      const pts = 1;
      setScore((s) => s + pts);
      addTerminalLines([
        { text: `> guess: ${key}`, color: "var(--cyan)" },
        { text: `✓ CORRECT — ${scene.solution.explanations[key]}`, color: "var(--green)" },
      ]);
      setCustodyLog((log) => [
        ...log,
        {
          time: new Date().toISOString().slice(11, 19),
          finding: GUESS_BUTTONS.find((b) => b.key === key)!.label,
          file: selectedFile.name,
          score: pts,
        },
      ]);
    } else {
      addTerminalLines([
        { text: `> guess: ${key}`, color: "var(--cyan)" },
        { text: `✗ INCORRECT — No evidence of ${key} found in this file.`, color: "var(--red)" },
      ]);
    }
  };

  const handleAutoScan = async () => {
    if (autoScanned || isScanning) return;
    setAutoScanned(true);
    setIsScanning(true);

    const missed = scene.solution.findings.filter((f) => {
      const confirmed = confirmedFindings.get(f);
      return confirmed !== true;
    });

    const lines: { text: string; color?: string }[] = [
      { text: "> AUTO SCAN — running deep forensic analysis...", color: "var(--amber)" },
      { text: "[*] Analyzing all evidence...", color: "var(--cyan)" },
    ];

    missed.forEach((f) => {
      lines.push({
        text: `[AUTO] Found: ${f.toUpperCase()} — ${scene.solution.explanations[f]}`,
        color: "var(--amber)",
      });
    });

    if (missed.length === 0) {
      lines.push({ text: "[*] All findings already discovered. Excellent work!", color: "var(--green)" });
    }

    lines.push({ text: "[*] Investigation complete.", color: "var(--green)" });
    addTerminalLines(lines, 200);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    if (userId) {
      try {
        await fetch("/api/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: scene.id,
            score,
            maxScore,
            usedAutoScan: true,
            timeTaken,
            findings: Object.fromEntries(confirmedFindings),
          }),
        });
      } catch {}
    }

    setTimeout(() => {
      setIsScanning(false);
      setShowCompletion(true);
    }, lines.length * 200 + 500);
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === "scan") {
      runScan(selectedFile);
    } else if (trimmed === "new") {
      const next = SCENES.find((s) => s.id !== scene.id);
      if (next) window.location.href = `/lab/${next.id}`;
    } else if (trimmed === "help") {
      addTerminalLines([
        { text: "> help", color: "var(--green)" },
        { text: "  scan      — analyze currently selected file", color: "var(--text-dim)" },
        { text: "  new       — load a new crime scene", color: "var(--text-dim)" },
        { text: "  help      — show this message", color: "var(--text-dim)" },
      ]);
    } else {
      addTerminalLines([{ text: `> ${cmd}`, color: "var(--text)" }, { text: "Unknown command. Type 'help' for list.", color: "var(--red)" }]);
    }
  };

  const nextSceneId = SCENES.find((s) => parseInt(s.id) > parseInt(scene.id))?.id;

  if (showOnboarding) {
    return <OnboardingModal scene={scene} onStart={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--panel)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="font-bold glow-green" style={{ fontFamily: "var(--font-display)", color: "var(--green)", fontSize: 16 }}>
              FORENSICLAB
            </span>
          </Link>
          <span style={{ color: "var(--text-dim)" }}>
            SCENE #{scene.id} — {scene.title.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ color: "var(--text-dim)" }}>
            SCORE: <span style={{ color: "var(--green)" }}>{score}/{maxScore}</span>
          </span>
          <Link href="/dashboard" className="hover:opacity-70" style={{ color: "var(--text-dim)" }}>
            ← DASHBOARD
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["analysis", "timeline", "network", "custody"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 text-xs tracking-widest transition-all"
            style={{
              fontFamily: "var(--font-display)",
              color: activeTab === tab ? "var(--green)" : "var(--text-dim)",
              borderBottom: activeTab === tab ? "2px solid var(--green)" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {tab === "analysis" ? "FILE ANALYSIS" : tab === "timeline" ? "TIMELINE" : tab === "network" ? "NETWORK FORENSICS" : "CHAIN OF CUSTODY"}
          </button>
        ))}
      </div>

      {/* Main content */}
      {activeTab === "analysis" && (
        <div className="flex flex-1 gap-0" style={{ minHeight: "calc(100vh - 88px)" }}>
          {/* LEFT PANEL */}
          <div
            className="flex flex-col w-64 flex-shrink-0 p-4 gap-4"
            style={{ borderRight: "1px solid var(--border)", background: "var(--panel)" }}
          >
            {/* File list */}
            <div>
              <div className="text-xs tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                EVIDENCE FILES
              </div>
              <div className="flex flex-col gap-1.5">
                {scene.files.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => { setSelectedFile(f); runScan(f); }}
                    className="flex items-center justify-between p-2 text-left transition-all hover:opacity-80"
                    style={{
                      background: selectedFile.name === f.name ? "rgba(0,255,136,0.08)" : "transparent",
                      border: `1px solid ${selectedFile.name === f.name ? "rgba(0,255,136,0.3)" : "transparent"}`,
                      borderRadius: 3,
                    }}
                  >
                    <span
                      className="text-xs truncate max-w-[140px]"
                      style={{ color: selectedFile.name === f.name ? "var(--text)" : "var(--text-dim)" }}
                    >
                      {f.name}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${
                        f.risk === "HIGH" ? "badge-high" : f.risk === "MED" ? "badge-med" : f.risk === "LOW" ? "badge-low" : "badge-clean"
                      }`}
                    >
                      {f.risk}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--border)" }} />

            {/* YOUR GUESS */}
            <div>
              <div className="text-xs tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>
                YOUR GUESS
              </div>
              <div className="flex flex-col gap-2">
                {GUESS_BUTTONS.map((btn) => {
                  const result = confirmedFindings.get(btn.key);
                  const tried = result !== undefined;
                  return (
                    <div key={btn.key} className="relative">
                      <button
                        onClick={() => handleGuess(btn.key)}
                        disabled={autoScanned || tried}
                        onMouseEnter={() => setTooltip(btn.tip)}
                        onMouseLeave={() => setTooltip(null)}
                        className="w-full text-left px-3 py-2 text-xs font-bold tracking-wider transition-all flex items-center justify-between"
                        style={{
                          fontFamily: "var(--font-display)",
                          background: tried
                            ? result
                              ? "rgba(0,255,136,0.12)"
                              : "rgba(255,51,85,0.1)"
                            : "rgba(0,255,136,0.06)",
                          border: `1px solid ${tried ? (result ? "rgba(0,255,136,0.4)" : "rgba(255,51,85,0.3)") : "var(--border)"}`,
                          color: tried ? (result ? "var(--green)" : "var(--red)") : "var(--text)",
                          cursor: autoScanned || tried ? "not-allowed" : "pointer",
                          opacity: autoScanned && !tried ? 0.5 : 1,
                          borderRadius: 3,
                        }}
                      >
                        {btn.label}
                        <span className="ml-2 flex-shrink-0">
                          {tried ? (result ? "✓" : "✗") : <span style={{ color: "var(--text-dim)" }}>?</span>}
                        </span>
                      </button>
                    </div>
                  );
                })}
                {tooltip && (
                  <div
                    className="text-xs p-2 rounded mt-1"
                    style={{ background: "rgba(0,0,0,0.7)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
                  >
                    {tooltip}
                  </div>
                )}
              </div>
            </div>

            {/* AUTO SCAN */}
            <button
              onClick={handleAutoScan}
              disabled={autoScanned || isScanning}
              className="btn-autoscan w-full py-3 font-bold tracking-widest text-sm transition-all mt-2"
              style={{
                fontFamily: "var(--font-display)",
                background: autoScanned ? "rgba(0,255,136,0.1)" : "var(--green)",
                color: autoScanned ? "var(--green)" : "#050a06",
                border: `2px solid var(--green)`,
                cursor: autoScanned ? "not-allowed" : "pointer",
                borderRadius: 3,
                opacity: autoScanned ? 0.7 : 1,
              }}
            >
              {autoScanned ? "✓ SCANNED" : "AUTO SCAN"}
            </button>

            {/* NEW SCENE */}
            {nextSceneId ? (
              <Link href={`/lab/${nextSceneId}`}>
                <button
                  className="w-full py-2 text-xs font-bold tracking-widest transition-all hover:opacity-80"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text-dim)",
                    borderRadius: 3,
                  }}
                >
                  NEW SCENE →
                </button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <button
                  className="w-full py-2 text-xs font-bold tracking-widest transition-all hover:opacity-80"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text-dim)",
                    borderRadius: 3,
                  }}
                >
                  DASHBOARD →
                </button>
              </Link>
            )}

            {/* Score bar */}
            <div className="mt-auto">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--text-dim)" }}>SCORE</span>
                <span style={{ color: "var(--green)" }}>{score}/{maxScore}</span>
              </div>
              <div className="h-1.5 rounded overflow-hidden" style={{ background: "rgba(0,255,136,0.1)" }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`,
                    background: "var(--green)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* CENTER PANEL — Terminal */}
          <div className="flex-1 flex flex-col scanlines relative" style={{ background: "var(--bg)" }}>
            <div className="absolute inset-0 grid-bg" />
            <div
              ref={terminalRef}
              className="relative z-10 flex-1 p-4 overflow-y-auto font-mono text-xs space-y-0.5"
              style={{ color: "var(--text)" }}
            >
              {terminalLines.map((line, i) => (
                <div key={i} className="term-line leading-relaxed" style={{ color: line.color ?? "var(--text)" }}>
                  {line.text}
                </div>
              ))}
              {isScanning && (
                <div style={{ color: "var(--amber)" }}>
                  [*] Running analysis
                  <span className="cursor-blink ml-1">█</span>
                </div>
              )}
            </div>
            {/* Command input */}
            <div
              className="relative z-10 flex items-center px-4 py-2 gap-2"
              style={{ borderTop: "1px solid var(--border)", background: "var(--panel)" }}
            >
              <span style={{ color: "var(--green)" }}>$</span>
              <input
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && cmdInput.trim()) {
                    handleCommand(cmdInput);
                    setCmdInput("");
                  }
                }}
                className="flex-1 bg-transparent outline-none text-xs"
                style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}
                placeholder="scan | new | help"
              />
            </div>
          </div>

          {/* RIGHT PANEL — Live Analysis */}
          <div
            className="w-56 flex-shrink-0 p-4 flex flex-col gap-4"
            style={{ borderLeft: "1px solid var(--border)", background: "var(--panel)" }}
          >
            <div className="text-xs tracking-widest" style={{ color: "var(--text-dim)" }}>
              LIVE ANALYSIS
            </div>

            {/* Risk score ring */}
            <div className="flex flex-col items-center gap-2">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(0,255,136,0.1)" strokeWidth="8" />
                <circle
                  cx="45" cy="45" r="40"
                  fill="none"
                  stroke={RISK_COLOR[selectedFile.risk]}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 - (selectedFile.risk_score / 100) * 251.3}
                  transform="rotate(-90 45 45)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
                <text x="45" y="49" textAnchor="middle" fontSize="18" fill={RISK_COLOR[selectedFile.risk]} fontFamily="var(--font-display)" fontWeight="bold">
                  {selectedFile.risk_score}
                </text>
                <text x="45" y="62" textAnchor="middle" fontSize="9" fill="var(--text-dim)" fontFamily="var(--font-mono)">
                  RISK SCORE
                </text>
              </svg>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold ${
                  selectedFile.risk === "HIGH" ? "badge-high" : selectedFile.risk === "MED" ? "badge-med" : selectedFile.risk === "LOW" ? "badge-low" : "badge-clean"
                }`}
              >
                {selectedFile.risk}
              </span>
            </div>

            {/* Type info */}
            <div className="space-y-3">
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--text-dim)" }}>DECLARED TYPE</div>
                <div className="text-xs" style={{ color: "var(--text)" }}>{selectedFile.declared_type}</div>
              </div>
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--text-dim)" }}>ACTUAL TYPE</div>
                <div
                  className="text-xs font-bold"
                  style={{ color: selectedFile.risk === "HIGH" ? "var(--red)" : selectedFile.risk === "MED" ? "var(--amber)" : "var(--green)" }}
                >
                  {selectedFile.actual_type}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)" }} />

            {/* Tags */}
            <div>
              <div className="text-xs mb-2" style={{ color: "var(--text-dim)" }}>FINDINGS</div>
              <div className="flex flex-wrap gap-1">
                {selectedFile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5"
                    style={{
                      background: "rgba(0,204,255,0.08)",
                      border: "1px solid rgba(0,204,255,0.2)",
                      color: "var(--cyan)",
                      borderRadius: 2,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)" }} />

            {/* Hash */}
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-dim)" }}>SHA-256</div>
              <div
                className="text-xs break-all"
                style={{ color: "var(--text-dim)", fontSize: 9, lineHeight: 1.6 }}
              >
                {selectedFile.hash}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && <TabTimeline timeline={scene.timeline} />}
      {activeTab === "network" && <TabNetwork networkLog={scene.network_log} />}
      {activeTab === "custody" && <TabCustody log={custodyLog} onAddManual={(entry) => setCustodyLog((l) => [...l, entry])} />}

      {/* Completion modal */}
      {showCompletion && (
        <CompletionModal
          score={score}
          maxScore={maxScore}
          confirmedFindings={confirmedFindings}
          scene={scene}
          nextSceneId={nextSceneId}
          onRetry={() => window.location.reload()}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
}
