"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFlowShell } from "@/components/auth-flow-shell";

export default function AuthResetClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialEmail = searchParams?.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Unable to reset password.");
      }

      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/auth?mode=login");
      }, 900);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFlowShell
      eyebrow="Secure recovery"
      title="Enter your reset code"
      description="Paste the one-time code from your email, choose a new password, and you will be signed back in from the login page."
      compact
      showMobileBrand={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="reset-email" className="text-sm font-semibold text-[var(--ink)]">
              Email address
            </label>
            <input
              id="reset-email"
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="reset-code" className="text-sm font-semibold text-[var(--ink)]">
              One-time code
            </label>
            <input
              id="reset-code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm tracking-[0.24em] text-[var(--ink)] shadow-sm outline-none transition placeholder:tracking-normal placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reset-new-password" className="text-sm font-semibold text-[var(--ink)]">
              New password
            </label>
            <input
              id="reset-new-password"
              required
              type="password"
              autoComplete="new-password"
              placeholder="Create a new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reset-confirm-password" className="text-sm font-semibold text-[var(--ink)]">
              Confirm password
            </label>
            <input
              id="reset-confirm-password"
              required
              type="password"
              autoComplete="new-password"
              placeholder="Repeat the password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">
          Tip: paste the code exactly as it appears in your email. If it expired, go back and request a fresh one.
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(5,87,74,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_14px_36px_rgba(5,87,74,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Resetting password..." : "Reset password"}
          </button>
          <a
            href="/auth/forgot"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:bg-black/[0.02]"
          >
            Request a new code
          </a>
        </div>
      </form>
    </AuthFlowShell>
  );
}
