"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function AuthRegisterFlow() {
  const [state, setState] = useState<RegisterState>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUserId = window.localStorage.getItem("plugr_verification_user_id");
      const storedEmail = window.localStorage.getItem("plugr_verification_email");
      const verificationPending = window.localStorage.getItem("plugr_verification_pending");

      if (storedUserId && storedEmail && verificationPending === "1") {
        setUserId(storedUserId);
        setState((prev) => ({ ...prev, email: storedEmail }));
      }
    } catch (error) {
      console.error("Unable to restore verification state", error);
    }
  }, []);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (state.password !== state.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: state.fullName,
          email: state.email,
          password: state.password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        userId?: string;
      };

      if (!response.ok || !data.userId) {
        throw new Error(data.error || "Unable to register account.");
      }

      setUserId(data.userId);
      window.localStorage.setItem("plugr_verification_user_id", data.userId);
      window.localStorage.setItem("plugr_verification_email", state.email);
      window.localStorage.setItem("plugr_verification_pending", "1");
      setMessage("Account created. Enter the verification code sent to your email.");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setMessage(null);

    if (!userId) {
      setError("Create an account first.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", userId }),
      });

      const data = (await response.json()) as {
        error?: string;
        resent?: boolean;
      };

      if (!response.ok || !data.resent) {
        throw new Error(data.error || "Unable to resend verification code.");
      }

      setMessage(`A new verification code has been sent to ${state.email}.`);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setResending(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!userId) {
      setError("Create an account first.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: verificationCode }),
      });

      const data = (await response.json()) as {
        error?: string;
        verified?: boolean;
        userId?: string;
      };
      if (!response.ok || !data.verified || !data.userId) {
        throw new Error(data.error || "Unable to verify account.");
      }

      window.localStorage.removeItem("plugr_verification_user_id");
      window.localStorage.removeItem("plugr_verification_email");
      window.localStorage.removeItem("plugr_verification_pending");
      window.localStorage.setItem("plugr_user_id", data.userId);
      document.cookie = `plugr_user_id=${data.userId}; Path=/; Max-Age=2592000; SameSite=Lax`;
      router.push("/profile/setup");
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Create account</p>
        <h2 className="font-display mt-2 text-3xl">Join Plugr</h2>
      </div>
      {!userId ? (
        <>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">Full name</label>
              <input required placeholder="Enter your full name" value={state.fullName} onChange={(event) => setState((prev) => ({ ...prev, fullName: event.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm placeholder-[var(--muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">Email address</label>
              <input required type="email" placeholder="you@example.com" value={state.email} onChange={(event) => setState((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm placeholder-[var(--muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">Password</label>
              <input required type="password" minLength={6} placeholder="At least 6 characters" value={state.password} onChange={(event) => setState((prev) => ({ ...prev, password: event.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm placeholder-[var(--muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">Confirm password</label>
              <input required type="password" minLength={6} placeholder="Confirm your password" value={state.confirmPassword} onChange={(event) => setState((prev) => ({ ...prev, confirmPassword: event.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm placeholder-[var(--muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            <p className="text-xs text-[var(--muted)] text-center">
              By clicking Create account, you agree to our{" "}
              <a href="/terms" className="font-semibold text-[var(--accent)] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy-policy" className="font-semibold text-[var(--accent)] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60 mt-2">{busy ? "Creating account..." : "Create account"}</button>
          </form>
          <p className="text-center text-sm text-[var(--muted)] mt-4">Already have an account? <a href="/auth?mode=login" className="font-semibold text-[var(--accent)]">Login here</a></p>
        </>
      ) : (
        <>
          <form onSubmit={handleVerify} className="space-y-4">
            <h3 className="font-display text-2xl font-semibold">Verify your email</h3>
            <p className="text-sm text-[var(--muted)]">We&apos;ve sent a verification code to <strong>{state.email}</strong></p>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--ink)]">Verification code</label>
              <input required inputMode="numeric" placeholder="Enter 6-digit code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm placeholder-[var(--muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            {message && <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2">{message}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60 mt-4">{busy ? "Verifying..." : "Verify and continue"}</button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={busy || resending}
              className="w-full rounded-xl border border-[var(--accent)]/30 bg-transparent px-4 py-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/5 disabled:opacity-60"
            >
              {resending ? "Resending..." : "Resend code"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
