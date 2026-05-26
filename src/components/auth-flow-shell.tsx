import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthFlowShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  compact?: boolean;
  showMobileBrand?: boolean;
};

export function AuthFlowShell({ eyebrow, title, description, children, compact = false, showMobileBrand = true }: AuthFlowShellProps) {
  return (
    <main className={`relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(72,181,163,0.18),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(198,167,97,0.16),_transparent_38%),linear-gradient(180deg,_#f7fbfa_0%,_#eef4f2_100%)] px-4 ${compact ? "py-0 sm:px-4" : "py-6 sm:px-6"} lg:px-8`}>
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-8rem] top-12 h-72 w-72 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-36 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-white/70 to-transparent" />
      </div>

      <div className={`relative mx-auto grid ${compact ? "min-h-screen" : "min-h-[calc(100vh-3rem)]"} w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 shadow-[0_24px_80px_rgba(10,30,20,0.12)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]`}>
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-black/5 bg-[linear-gradient(145deg,rgba(5,87,74,0.96),rgba(7,103,88,0.92))] p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="relative z-10 max-w-md space-y-8">
            <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15">
              <Image src="/plugr.png" alt="Plugr" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
              Plugr
            </Link>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">{eyebrow}</p>
              <h1 className="font-display text-5xl font-bold leading-[1.05]">{title}</h1>
              <p className="max-w-sm text-base leading-7 text-white/78">{description}</p>
            </div>
          </div>

          <div className="relative z-10 text-sm text-white/80" />
        </section>

        <section className={`flex items-center justify-center ${compact ? "px-4 py-0 sm:px-6" : "px-5 py-10 sm:px-8"} lg:px-10`}>
          <div className="w-full max-w-lg">
            {showMobileBrand ? (
              <div className="mb-8 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm">
                  <Image src="/plugr.png" alt="Plugr" width={24} height={24} className="h-6 w-6 rounded-md object-cover" />
                  Plugr
                </Link>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-[0_20px_50px_rgba(10,30,20,0.08)] sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-[var(--ink)]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
              </div>

              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
