import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { DiscoverWorkflow } from "@/components/workflows/discover-workflow";
import { findProviders } from "@/lib/profile-store";
import { BreadcrumbSchema } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Discover Providers - Plugr | Find Skilled Students on Campus",
  description:
    "Search and discover verified LASU students offering services. Filter by skill, faculty, verification status, and credibility. Connect with trusted professionals on campus.",
  openGraph: {
    title: "Discover Providers - Plugr",
    description:
      "Search and discover verified LASU students offering services. Filter by skill, verification, and credibility.",
    type: "website",
    url: "https://useplugr.app/discover",
  },
};

export default async function DiscoverPage() {
  const authCookie = (await cookies()).get("plugr_user_id")?.value;
  if (!authCookie) {
    redirect("/auth?mode=login");
  }

  // Client component will fetch providers via API
  const providers: any[] = [];

  return (
    <>
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Discover", url: "https://useplugr.app/discover" },
      ])}
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rise rounded-2xl border border-black/10 bg-[var(--card)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Discovery
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">
            Find the right student fast
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Results are ranked by credibility, response quality, profile completeness, and verification.
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Use search and verification filters below to discover real registered providers.
          </p>
        </header>
        <DiscoverWorkflow initialProviders={providers} />
      </div>
    </main>
    </>
  );
}
