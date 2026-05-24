"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";

type SiteHeaderProps = {
  current: string;
  variant?: "default" | "landing";
};

const links: Array<{ href: string; label: string }> = [
  { href: "/", label: "Product" },
  { href: "/discover", label: "Discover" },
];

const landingLinks: Array<{ href: string; label: string }> = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faqs", label: "FAQs" },
];

export function SiteHeader({ current, variant = "default" }: SiteHeaderProps) {
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("plugr_user_id");
  });
  const router = useRouter();

  function handleLogout() {
    window.localStorage.removeItem("plugr_user_id");
    document.cookie = "plugr_user_id=; Path=/; Max-Age=0; SameSite=Lax";
    setUserId(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/30 bg-white/60 px-4 py-3 shadow-[0_18px_50px_rgba(10,30,20,0.12)] backdrop-blur-2xl saturate-150 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-2 font-[var(--font-display)] text-lg font-bold">
        <Image
          src="/plugr.png"
          alt="Plugr"
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg object-cover"
          priority
        />
        Plugr
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {variant === "landing" ? (
          <>
            <nav className="hidden md:flex items-center gap-1 rounded-xl bg-black/5 p-1 text-sm sm:gap-2">
              {landingLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 font-medium text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link href="/auth" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
              Login
            </Link>
            <Link href="/auth" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
              Get started
            </Link>
            <NotificationBell className="ml-1" />
          </>
        ) : (
          <>
            <nav className="hidden md:flex items-center gap-1 rounded-xl bg-black/5 p-1 text-sm sm:gap-2">
              {links.map((link) => {
                const active = current === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-1.5 font-medium transition ${
                      active ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            {userId ? (
              <>
                <NotificationBell />
                <Link
                  href="/profile/setup"
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    current === "/profile/setup"
                      ? "bg-white text-[var(--ink)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    current === "/settings"
                      ? "bg-white text-[var(--ink)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-black/10 bg-white px-3 py-1.5 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    current === "/login"
                      ? "bg-white text-[var(--ink)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    current === "/register"
                      ? "bg-white text-[var(--ink)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}
