"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";

export default function EmailVerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // If a verification email was just sent (or user redirected here after login),
  // prefill the email and show the OTP entry step.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("plugr_verification_email");
      if (stored) {
        setEmail(stored);
        setStep("otp");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Validate email format
  const isValidEmail = (value: string): boolean => {
    return value.endsWith("@st.lasu.edu.ng");
  };

  // Handle send OTP
  const handleSendOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please use your LASU student email (@st.lasu.edu.ng)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-email-otp",
          emailAddress: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setSuccess("OTP sent to your email!");
      setStep("otp");
      // Set 15-minute expiry
      const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      setOtpExpiry(expiryTime);
      setCanResend(false);
      setResendTimer(60);
    } catch (err) {
      setError("Error sending OTP. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Handle verify OTP
  const handleVerifyOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-email-otp",
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to verify OTP");
        return;
      }

      setSuccess("✓ Email verified successfully!");
      setTimeout(() => {
        router.push("/verification");
      }, 1500);
    } catch (err) {
      setError("Error verifying OTP. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [otp, router]);

  // Handle resend OTP
  const handleResendOTP = useCallback(async () => {
    setError("");
    setSuccess("");
    await handleSendOTP(new Event("submit") as any);
  }, [handleSendOTP]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && step === "otp") {
      setCanResend(true);
    }
  }, [resendTimer, step]);

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-2xl border border-black/10 bg-[var(--card)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Verification
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">
            Verify Your Email
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {step === "email"
              ? "Enter your LASU student email to get started"
              : "Enter the 6-digit code we sent to your email"}
          </p>
        </header>

        <div className="rounded-2xl border border-black/10 bg-[var(--card)] p-6">
          {/* Step 1: Email Input */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--ink)]">
                  LASU Student Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="your-name@st.lasu.edu.ng"
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
                />
                <p className="mt-2 text-xs text-[var(--muted)]">Must end with @st.lasu.edu.ng</p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-white transition-all hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </form>
          )}

          {/* Step 2: OTP Input */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-[var(--ink)]">
                  Enter 6-Digit Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                    setError("");
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-4 font-mono text-2xl font-bold text-center letter-spacing-4 transition-colors focus:border-[var(--accent)] focus:outline-none"
                />
                {otpExpiry && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Code expires at {new Date(otpExpiry).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-white transition-all hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div className="pt-4 border-t border-black/10 text-center">
                <p className="text-sm text-[var(--muted)] mb-3">Didn't receive the code?</p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="inline-block rounded-lg bg-[var(--accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20 disabled:opacity-50"
                  >
                    {loading ? "Resending..." : "Resend Code"}
                  </button>
                ) : (
                  <p className="text-sm font-medium text-[var(--accent)]">
                    {resendTimer > 0 ? `Resend available in ${resendTimer}s` : ""}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="flex justify-center">
          <Link
            href="/verification"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
          >
            ← Back to Verification
          </Link>
        </div>
      </div>
    </main>
  );
}
