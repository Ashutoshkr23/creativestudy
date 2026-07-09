"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"student" | "teacher">(
    searchParams.get("role") === "teacher" ? "teacher" : "student"
  );
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          role === "teacher"
            ? { role, username, password: secret }
            : { role, username, pin: secret }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
      } else {
        router.push(data.redirect ?? "/");
        router.refresh();
      }
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-center font-head text-4xl font-bold">
        learn<span className="text-primary">.</span>
      </h1>
      <p className="mb-6 text-center text-sm text-ink-secondary">
        {role === "student" ? "Welcome back! Enter your username and PIN." : "Teacher login"}
      </p>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-btn border border-line bg-surface p-1">
        {(["student", "teacher"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setError(null);
            }}
            className={`rounded-[6px] py-2 font-head text-sm font-semibold capitalize transition-colors ${
              role === r ? "bg-primary text-white" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {r === "student" ? "🎒 Student" : "🍎 Teacher"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="rounded-btn border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder={role === "student" ? "PIN (4–6 digits)" : "Password"}
          type="password"
          inputMode={role === "student" ? "numeric" : undefined}
          autoComplete="current-password"
          required
          className="rounded-btn border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
        {error && (
          <p role="alert" className="rounded-btn border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-btn bg-primary py-3 font-head font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {busy ? "Logging in…" : "Log in →"}
        </button>
      </form>

      {role === "student" && (
        <p className="mt-5 text-center text-xs text-ink-muted">
          Forgot your PIN? Ask your teacher to reset it.
        </p>
      )}
    </div>
  );
}
