import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { BuyNowButton } from "@/components/stores/buy-now-button";
import { getStoreBySlug } from "@/lib/store-store";
import { getProductsByProvider } from "@/lib/product-store";
import { getProfileById } from "@/lib/profile-store";

type StorefrontPageProps = {
  params: Promise<{ slug: string }>;
};

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) {
    return digits;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) {
    return {
      title: "Store not found - Plugr",
      robots: { index: false, follow: false },
    };
  }
  const description = store.tagline || store.description || `${store.name} on Plugr Stores.`;

  return {
    title: `${store.name} - Plugr Stores`,
    description,
    openGraph: {
      title: store.name,
      description,
      type: "website",
      url: `https://useplugr.app/stores/${store.slug}`,
      images: [
        {
          url: `/stores/${store.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: store.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: store.name,
      description,
      images: [`/stores/${store.slug}/opengraph-image`],
    },
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) {
    notFound();
  }

  const [products, provider] = await Promise.all([
    getProductsByProvider(store.providerId, 50),
    getProfileById(store.providerId),
  ]);

  const whatsapp = store.whatsapp || provider?.phone || "";
  const cleanPhone = formatPhoneForWhatsApp(whatsapp);
  const waMessage = encodeURIComponent(`Hi ${store.name}, I saw your store on Plugr and I'd like to make an order.`);
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : null;

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Banner */}
        <section className="overflow-hidden rounded-3xl border border-black/10 bg-[var(--card)]">
          {store.bannerUrl ? (
            <Image
              src={store.bannerUrl}
              alt={`${store.name} banner`}
              width={1200}
              height={300}
              className="h-44 w-full object-cover sm:h-60"
            />
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 via-[var(--card)] to-[var(--accent)]/10 sm:h-60">
              <span className="font-display text-6xl font-bold text-[var(--accent)]/40">
                {initialsFromName(store.name)}
              </span>
            </div>
          )}
          <div className="p-6 sm:p-8">
            {store.logoUrl ? (
              <div className="relative z-10 -mt-20 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:-mt-24 sm:h-28 sm:w-28">
                <Image
                  src={store.logoUrl}
                  alt={`${store.name} logo`}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className={`flex flex-wrap items-center gap-3 ${store.logoUrl ? "mt-4" : ""}`}>
              <h1 className="font-display text-4xl font-bold">{store.name}</h1>
              {provider?.verificationStatus === "verified" ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg" title="Verified">
                  <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              ) : null}
            </div>
            {store.tagline ? <p className="mt-2 text-lg text-[var(--muted)]">{store.tagline}</p> : null}
            {store.description ? (
              <p className="mt-3 max-w-3xl text-sm text-[var(--muted)]">{store.description}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              ) : null}
              <Link
                href={`/discover/provider/${store.providerId}`}
                className="inline-flex rounded-xl border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold"
              >
                View provider profile
              </Link>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Products ({products.length})</p>
          {products.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((product) => {
                const image = product.imageUrls[0];
                return (
                  <article key={product.id} className="overflow-hidden rounded-xl border border-black/10 bg-[var(--card)]">
                    <Link href={`/p/${product.id}`}>
                      <div className="aspect-square overflow-hidden bg-white">
                        {image ? (
                          <Image
                            src={image}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="h-full w-full object-cover transition hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[var(--accent)] text-2xl font-semibold text-white">
                            {initialsFromName(product.name)}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link href={`/p/${product.id}`} className="text-sm font-semibold hover:underline">
                        {product.name}
                      </Link>
                      {product.price ? <p className="mt-1 text-sm font-bold text-[var(--accent)]">{product.price}</p> : null}
                      <BuyNowButton productId={product.id} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">No products yet. Check back soon.</p>
          )}
        </section>
      </div>
    </main>
  );
}
