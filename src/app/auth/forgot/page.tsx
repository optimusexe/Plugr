"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFlowShell } from "@/components/auth-flow-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Unable to send reset code.");
      }

      setMessage("If an account exists for that email, we sent a one-time code. Check your inbox and spam folder.");
      router.push(`/auth/reset?email=${encodeURIComponent(email)}`);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFlowShell
      eyebrow="Account access"
      title="Reset your password"
      description="We will email a one-time code so you can securely set a new password and get back into Plugr."
      compact
      showMobileBrand={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="forgot-email" className="text-sm font-semibold text-[var(--ink)]">
            Email address
          </label>
          <input
            id="forgot-email"
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
          />
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
            {busy ? "Sending code..." : "Send reset code"}
          </button>
          <a
            href="/auth?mode=login"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:bg-black/[0.02]"
          >
            Back to login
          </a>
        </div>
      </form>
    </AuthFlowShell>
  );
}
