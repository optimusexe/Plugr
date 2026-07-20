import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthRegisterFlow } from "@/components/workflows/auth-register-flow";
import { AuthLoginForm } from "@/components/workflows/auth-login-form";

export const metadata: Metadata = {
  title: "Sign Up / Login - Plugr",
  robots: {
    index: false,
    follow: false,
  },
};

type AuthPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const mode = params.mode || "register";

  return (
    <main className="h-screen overflow-hidden grid md:grid-cols-2 fixed inset-0">
      {/* Left Panel - Branding & Benefits */}
      <div className="hidden md:flex flex-col justify-center items-start bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 px-12 py-16 text-white">
        <div className="space-y-8 max-w-sm">
          <div>
            <h1 className="font-display text-5xl font-bold leading-tight mb-4">
              {mode === "login" ? "Welcome back" : "Join Plugr"}
            </h1>
            <p className="text-white/80 text-lg">
              {mode === "login"
                ? "Access your account and continue connecting on campus."
                : "Connect and get hired on campus in seconds."}
            </p>
          </div>

          {mode === "register" && (
            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                <div>
                  <p className="font-semibold">Fast setup</p>
                  <p className="text-sm text-white/70">Create account in under 2 minutes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                <div>
                  <p className="font-semibold">No credit card needed</p>
                  <p className="text-sm text-white/70">Start exploring for free today</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                <div>
                  <p className="font-semibold">Campus focused</p>
                  <p className="text-sm text-white/70">Built for LASU students first</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center items-center bg-[var(--bg)] px-6 py-12 md:px-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <Image
              src="/plugr.png"
              alt="Plugr logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-[var(--font-display)] text-xl font-semibold">Plugr</span>
          </Link>
          <Suspense fallback={<div>Loading...</div>}>
            {mode === "login" ? <AuthLoginForm /> : <AuthRegisterFlow />}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
