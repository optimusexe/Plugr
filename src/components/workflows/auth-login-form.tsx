"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string; userId?: string; profileComplete?: boolean; isAdmin?: boolean };
      
      // Handle account not verified - redirect to email OTP page with prefill
      if (response.status === 403 && data.userId) {
        // Save user id and email so verification view can prefill the form
        window.localStorage.setItem("plugr_user_id", data.userId);
        window.localStorage.setItem("plugr_verification_user_id", data.userId);
        window.localStorage.setItem("plugr_verification_email", email);
        window.localStorage.setItem("plugr_verification_pending", "1");
        document.cookie = `plugr_user_id=${data.userId}; Path=/; Max-Age=2592000; SameSite=Lax`;
        router.push("/auth?mode=register");
        router.refresh();
        return;
      }

      if (!response.ok || !data.userId) {
        throw new Error(data.error || "Login failed.");
      }

      window.localStorage.setItem("plugr_user_id", data.userId);
      document.cookie = `plugr_user_id=${data.userId}; Path=/; Max-Age=2592000; SameSite=Lax`;
      if (data.isAdmin) {
        router.push("/admin/stats");
      } else {
        router.push(data.profileComplete ? "/discover" : "/profile/setup");
      }
      router.refresh();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Welcome back</p>
        <h2 className="font-display mt-2 text-3xl">Login</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">Email address</label>
        <input
          required
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm placeholder-[var(--muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">Password</label>
        <input
          required
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm placeholder-[var(--muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60 mt-4"
      >
        {busy ? "Signing in..." : "Login"}
      </button>
      <p className="text-center text-sm text-[var(--muted)] mt-4">
        Don&apos;t have an account? <a href="/auth?mode=register" className="font-semibold text-[var(--accent)]">Sign up here</a>
      </p>
    </form>
    </div>
  );
}
