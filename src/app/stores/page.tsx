import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { StoresWorkflow } from "@/components/stores/stores-workflow";
import { listStores } from "@/lib/store-store";

export const metadata: Metadata = {
  title: "Plugr Stores - Browse Products on Campus",
  description:
    "Browse products and services sold by verified LASU students. Search by category or provider and contact them directly via WhatsApp.",
  alternates: {
    canonical: "https://useplugr.app/stores",
  },
  openGraph: {
    title: "Plugr Stores",
    description:
      "Browse products and services sold by verified LASU students. Contact providers directly via WhatsApp.",
    type: "website",
    url: "https://useplugr.app/stores",
  },
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default async function StoresPage() {
  const authCookie = (await cookies()).get("plugr_user_id")?.value;
  if (!authCookie) {
    redirect("/auth?mode=login");
  }

  let stores: Awaited<ReturnType<typeof listStores>> = [];
  try {
    stores = await listStores({ limit: 8 });
  } catch {
    // Non-fatal: show products only if the store list fails.
  }

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rise rounded-2xl border border-black/10 bg-[var(--card)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Stores
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold">
            Shop the campus
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Products listed by verified providers. Found something you like? Buy directly via WhatsApp.
          </p>
        </header>

        {stores.length > 0 ? (
          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Stores</p>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {stores.map((store) => {
                const image = store.bannerUrl;
                return (
                  <Link
                    key={store.id}
                    href={`/stores/${store.slug}`}
                    className="overflow-hidden rounded-xl border border-black/10 bg-[var(--card)] transition hover:border-black/25"
                  >
                    <div className="relative aspect-[2/1] bg-gradient-to-br from-[var(--accent)]/25 to-[var(--card)]">
                      <div className="absolute inset-0 overflow-hidden">
                        {image ? (
                          <Image src={image} alt={store.name} width={400} height={200} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[var(--accent)] text-xl font-semibold text-white">
                            {initialsFromName(store.name)}
                          </div>
                        )}
                      </div>
                      {store.logoUrl ? (
                        <div className="absolute -bottom-4 left-3 h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow">
                          <Image
                            src={store.logoUrl}
                            alt={`${store.name} logo`}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold">{store.name}</p>
                      {store.tagline ? <p className="truncate text-xs text-[var(--muted)]">{store.tagline}</p> : null}
                      <p className="mt-1 text-xs font-semibold text-[var(--accent)]">
                        {store.productCount} product{store.productCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <StoresWorkflow />
      </div>
    </main>
  );
}
