"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Registration failed. Please try again.");
          setLoading(false);
          return;
        }
      } catch {
        setError("Could not reach the server. Please try again.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid-bg relative flex items-center justify-center px-4">
      <div className="scanlines absolute inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div
              className="text-4xl font-bold tracking-tight glow-green mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--green)" }}
            >
              FORENSICLAB
            </div>
          </Link>
          <div className="text-xs tracking-[0.3em]" style={{ color: "var(--text-dim)" }}>
            {mode === "login" ? "INVESTIGATOR LOGIN" : "CREATE ACCOUNT"}
          </div>
        </div>

        <div className="terminal-panel p-8">
          {/* Mode toggle */}
          <div className="flex mb-6" style={{ border: "1px solid var(--border)", borderRadius: 3 }}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2 text-xs font-bold tracking-widest transition-all"
                style={{
                  fontFamily: "var(--font-display)",
                  background: mode === m ? "rgba(0,255,136,0.12)" : "transparent",
                  color: mode === m ? "var(--green)" : "var(--text-dim)",
                  borderRight: m === "login" ? "1px solid var(--border)" : "none",
                }}
              >
                {m === "login" ? "SIGN IN" : "REGISTER"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "register" && (
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-dim)" }}>USERNAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your display name"
                  className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)" }}
                />
              </div>
            )}

            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-dim)" }}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)" }}
              />
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-dim)" }}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)" }}
              />
            </div>

            {error && (
              <div
                className="text-xs px-3 py-2"
                style={{ background: "rgba(255,51,85,0.1)", color: "var(--red)", border: "1px solid rgba(255,51,85,0.3)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-bold tracking-widest transition-all mt-1"
              style={{
                fontFamily: "var(--font-display)",
                background: loading ? "rgba(0,255,136,0.3)" : "var(--green)",
                color: "#050a06",
                border: "2px solid var(--green)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "PLEASE WAIT..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-5 text-center">
              <Link href="/lab/01" className="text-xs hover:opacity-80" style={{ color: "var(--text-dim)" }}>
                Try demo scene without logging in →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
