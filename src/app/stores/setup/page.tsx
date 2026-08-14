import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { getProfileByUserId } from "@/lib/profile-store";
import { getStoreByProviderId } from "@/lib/store-store";
import { isVerifiedProvider } from "@/lib/verified";
import { StoreSetupForm } from "@/components/stores/store-setup-form";

export const metadata: Metadata = {
  title: "Set up my store - Plugr",
  robots: { index: false, follow: false },
};

export default async function StoreSetupPage() {
  const userId = (await cookies()).get("plugr_user_id")?.value;
  if (!userId) {
    redirect("/auth?mode=login");
  }

  const profile = await getProfileByUserId(userId);

  if (!isVerifiedProvider(profile)) {
    return (
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-8 text-center">
          <h1 className="font-display text-3xl font-bold">Your Store</h1>
          <p className="mt-3 text-[var(--muted)]">
            Only verified providers can set up a Plugr store. Get verified to start selling on campus.
          </p>
          <a
            href="/verification"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Go to Verification
          </a>
        </section>
      </main>
    );
  }

  const store = await getStoreByProviderId(profile.id);

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <StoreSetupForm profile={profile} existingStore={store} />
    </main>
  );
}
