"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { getSession, login, signup } from "@/lib/auth";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Already signed in? Skip the login screen.
  useEffect(() => {
    if (getSession()) router.replace("/");
  }, [router]);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please enter both a login ID and a password.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const result =
        mode === "signup"
          ? await signup(username, password)
          : await login(username, password);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace("/");
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-[14px] border border-border bg-bg-light px-4 py-3 text-base text-text-dark outline-none transition focus:border-coral focus:bg-white";

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="animate-in w-full max-w-[400px]">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] bg-coral text-white shadow-[var(--shadow-card)]">
            <Wallet size={26} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-dark">
            Expense Tracker
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {mode === "login"
              ? "Welcome back. Sign in to continue."
              : "Create an account to get started."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[32px] bg-white p-7 shadow-[var(--shadow-card)]">
          {/* Mode toggle */}
          <div className="mb-6 flex gap-1 rounded-full bg-bg-light p-1">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === m
                    ? "bg-text-dark text-white"
                    : "text-text-mid hover:text-text-dark"
                }`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-text-mid">
                Login ID
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="namze"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-text-mid">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-dark"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="text-sm font-medium text-text-mid">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-dark"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-[12px] bg-coral/10 px-3 py-2 text-sm font-medium text-coral">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-full bg-coral py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {pending
                ? "Please wait…"
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-coral"
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
