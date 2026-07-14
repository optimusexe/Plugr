"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminShellProps = {
  adminName: string;
  children: ReactNode;
};

const navItems = [
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/verification", label: "Approvals" },
  { href: "/admin/support", label: "Live chat" },
  { href: "/admin/notifications", label: "Notifications" },
];

export function AdminShell({ adminName, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ed_0%,#eef4ef_48%,#f8faf8_100%)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-3 sm:px-6 lg:px-8 lg:pl-72">
        <aside className="hidden lg:block fixed left-8 top-6 w-64">
          <div className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,25,20,0.08)] backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Plugr</p>
              <h1 className="mt-2 font-display text-3xl font-semibold">Admin</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">Manage users, approvals, and platform health.</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active ? "bg-[var(--accent)] text-white shadow-lg" : "bg-black/5 hover:bg-black/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-black/10 bg-[var(--card)] p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Signed in as</p>
              <p className="mt-1 font-semibold">{adminName}</p>
              <Link href="/discover" className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
                Back to app
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 rounded-3xl border border-black/10 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Admin dashboard</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-2 text-sm font-semibold ${
                      active ? "bg-[var(--accent)] text-white" : "bg-black/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/discover" className="rounded-full bg-black px-3 py-2 text-sm font-semibold text-white">
                Back to app
              </Link>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}