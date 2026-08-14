import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { getProfileByUserId } from "@/lib/profile-store";
import { getStoreByProviderId } from "@/lib/store-store";
import { countProductsByProvider } from "@/lib/product-store";
import { isVerifiedProvider } from "@/lib/verified";
import { StoreManager } from "@/components/stores/store-manager";
import { DeleteStoreButton } from "@/components/stores/delete-store-button";

export const metadata: Metadata = {
  title: "Manage My Store - Plugr",
  robots: { index: false, follow: false },
};

export default async function StoreManagePage() {
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
            Only verified providers can list products on Plugr Stores. Get verified to start selling to students on campus.
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

  if (!store) {
    return (
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">My Store</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Set up your store first</h1>
          <p className="mt-3 text-[var(--muted)]">
            Give your store a name, tagline, banner, and WhatsApp number before adding products.
          </p>
          <Link
            href="/stores/setup"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Set up my store
          </Link>
        </section>
      </main>
    );
  }

  const productCount = await countProductsByProvider(profile.id);

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <div className="mx-auto mb-6 max-w-5xl rounded-2xl border border-black/10 bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Your store</p>
            <h1 className="mt-1 font-display text-2xl font-bold">{store.name}</h1>
            {store.tagline ? <p className="mt-1 text-sm text-[var(--muted)]">{store.tagline}</p> : null}
            <Link href={`/stores/${store.slug}`} className="mt-1 block text-xs font-semibold text-[var(--accent)] hover:underline">
              plugr.app/stores/{store.slug}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/stores/${store.slug}`}
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold"
            >
              View storefront
            </Link>
            <Link
              href="/stores/setup"
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Edit store
            </Link>
            <DeleteStoreButton storeSlug={store.slug} productCount={productCount} />
          </div>
        </div>
      </div>
      <StoreManager profile={profile} storeSlug={store.slug} />
    </main>
  );
}
