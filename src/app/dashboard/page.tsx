import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getProfileByUserId } from "@/lib/profile-store";
import { AppHeader } from "@/components/app-header";
import { AnalyticsShell } from "@/components/dashboard/analytics-shell";

export const metadata: Metadata = {
  title: "Provider Dashboard - Plugr",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const userId = (await cookies()).get("plugr_user_id")?.value;
  if (!userId) {
    redirect("/auth");
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return (
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-8 text-center">
          <h1 className="font-display text-3xl font-bold">Provider Dashboard</h1>
          <p className="mt-3 text-[var(--muted)]">
            You need a provider profile to view analytics.
          </p>
          <a
            href="/auth"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Create Profile
          </a>
        </section>
      </main>
    );
  }

  const isProvider = profile.mode === "provider" || profile.mode === "both";
  if (!isProvider) {
    return (
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-8 text-center">
          <h1 className="font-display text-3xl font-bold">Provider Dashboard</h1>
          <p className="mt-3 text-[var(--muted)]">
            Switch to provider mode to view analytics.
          </p>
          <a
            href="/settings"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Go to Settings
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[var(--card)] px-5 py-4">
        <p className="text-sm text-[var(--muted)]">
          Manage the products you sell on Plugr Stores.
        </p>
        <a
          href="/stores/manage"
          className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Manage My Store
        </a>
      </div>
      <AnalyticsShell providerId={profile.id} />
    </main>
  );
}
