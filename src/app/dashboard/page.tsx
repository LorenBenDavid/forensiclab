import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SCENES } from "@/lib/scenes-data";
import Link from "next/link";
import { signOut } from "@/lib/auth";

const CATEGORY_LABELS: Record<string, string> = {
  malware: "MALWARE & FILES",
  ransomware: "RANSOMWARE",
  network: "NETWORK & C2",
  insider: "INSIDER THREAT",
  web: "WEB & APP",
};

const CATEGORY_COLORS: Record<string, string> = {
  malware: "var(--red)",
  ransomware: "var(--amber)",
  network: "var(--cyan)",
  insider: "#c084fc",
  web: "var(--green)",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;

  const [stats, attempts] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.attempt.findMany({ where: { userId }, orderBy: { completedAt: "desc" } }),
  ]);

  const bestByScene = new Map<string, number>();
  for (const a of attempts) {
    const prev = bestByScene.get(a.sceneId) ?? 0;
    const pct = a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0;
    if (pct > prev) bestByScene.set(a.sceneId, pct);
  }

  const categories = Array.from(new Set(SCENES.map((s) => s.category)));

  return (
    <div className="min-h-screen grid-bg">
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="text-2xl font-bold glow-green" style={{ fontFamily: "var(--font-display)", color: "var(--green)" }}>
              FORENSICLAB
            </span>
          </Link>
          <span className="text-xs px-2 py-0.5 badge-clean rounded">DASHBOARD</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "var(--text-dim)" }}>{session.user.name}</span>
          {session.user.image && (
            <img src={session.user.image} alt="avatar" className="w-7 h-7 rounded-full" />
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-xs px-3 py-1 hover:opacity-70"
              style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}
            >
              LOGOUT
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "SCENES COMPLETED", value: stats?.scenesCompleted ?? 0 },
            { label: "TOTAL SCORE", value: stats?.totalScore ?? 0 },
            { label: "AVG ACCURACY", value: `${Math.round(stats?.accuracyPct ?? 0)}%` },
          ].map((s) => (
            <div key={s.label} className="terminal-panel p-4 text-center">
              <div className="text-3xl font-bold" style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}>
                {s.value}
              </div>
              <div className="text-xs mt-1 tracking-widest" style={{ color: "var(--text-dim)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {categories.map((cat) => {
          const catScenes = SCENES.filter((s) => s.category === cat);
          return (
            <div key={cat} className="mb-8">
              <div
                className="text-sm font-bold tracking-[0.2em] mb-3"
                style={{ color: CATEGORY_COLORS[cat], fontFamily: "var(--font-display)" }}
              >
                ▸ {CATEGORY_LABELS[cat] ?? cat.toUpperCase()}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {catScenes.map((scene) => {
                  const bestScore = bestByScene.get(scene.id);
                  const attempted = bestScore !== undefined;
                  return (
                    <Link key={scene.id} href={`/lab/${scene.id}`}>
                      <div
                        className="terminal-panel p-4 cursor-pointer transition-all hover:opacity-90"
                        style={{ borderColor: attempted ? "rgba(0,255,136,0.3)" : "var(--border)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>#{scene.id}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${scene.difficulty === "BEGINNER" ? "badge-clean" : scene.difficulty === "INTERMEDIATE" ? "badge-med" : "badge-high"}`}>
                            {scene.difficulty.slice(0, 3)}
                          </span>
                        </div>
                        <div className="text-sm font-bold leading-tight mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
                          {scene.title}
                        </div>
                        {attempted ? (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1 rounded overflow-hidden" style={{ background: "rgba(0,255,136,0.1)" }}>
                              <div
                                className="h-full rounded"
                                style={{ width: `${bestScore}%`, background: bestScore >= 70 ? "var(--green)" : bestScore >= 40 ? "var(--amber)" : "var(--red)" }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: "var(--text-dim)" }}>{bestScore}%</span>
                          </div>
                        ) : (
                          <div className="text-xs mt-2" style={{ color: "var(--text-dim)" }}>Not attempted</div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
