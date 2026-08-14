import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { getProductById, incrementProductViews } from "@/lib/product-store";
import { getProfileById } from "@/lib/profile-store";
import { recordAnalyticsEvent } from "@/lib/analytics-store";
import { BuyNowButton } from "@/components/stores/buy-now-button";
import { formatCredibilityScore } from "@/lib/credibility-colors";
import { BreadcrumbSchema, ProductSchema, WebPageSchema } from "@/lib/json-ld";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return {
      title: "Product not found - Plugr",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} - Plugr Stores`;
  const description = product.description || `${product.name} listed on Plugr Stores by a verified provider.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://useplugr.app/p/${product.id}`,
      images: [
        {
          url: `/p/${product.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/p/${product.id}/opengraph-image`],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const userId = (await cookies()).get("plugr_user_id")?.value;
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  // Fire-and-forget view tracking (mirrors the API route behavior).
  incrementProductViews(product.id).catch(() => undefined);
  recordAnalyticsEvent({
    providerId: product.providerId,
    eventType: "product_view",
    metadata: { productId: product.id },
    visitorId: userId ?? undefined,
  }).catch(() => undefined);

  const provider = await getProfileById(product.providerId);

  if (!provider) {
    notFound();
  }

  const verified = provider.verificationStatus === "verified";
  const images = product.imageUrls.length > 0 ? product.imageUrls : [""];

  return (
    <>
      {WebPageSchema(product.name, product.description || "", `https://useplugr.app/p/${product.id}`)}
      <ProductSchema
        name={product.name}
        description={product.description}
        image={product.imageUrls[0]}
        price={product.price}
        url={`https://useplugr.app/p/${product.id}`}
      />
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Stores", url: "https://useplugr.app/stores" },
        { name: product.name, url: `https://useplugr.app/p/${product.id}` },
      ])}
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <div className="mx-auto max-w-4xl space-y-6">
          <Link href="/stores" className="inline-flex rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold">
            Back to Stores
          </Link>

          <section className="grid gap-6 rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8">
            <div className="space-y-3">
              {images.map((image, index) =>
                image ? (
                  <div key={index} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <Image
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      width={800}
                      height={450}
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="h-72 w-full object-cover"
                    />
                  </div>
                ) : null,
              )}
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{product.category || "Store product"}</p>
              <h1 className="mt-2 font-display text-3xl font-bold">{product.name}</h1>
              {product.price ? (
                <p className="mt-3 text-2xl font-bold text-[var(--accent)]">{product.price}</p>
              ) : null}
              {product.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">{product.description}</p>
              ) : null}

              <div className="mt-4 flex items-center gap-4 text-xs text-[var(--muted)]">
                <span>{product.viewCount} views</span>
                <span>{product.clickCount} clicks</span>
              </div>

              <BuyNowButton productId={product.id} />
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Provider</p>
            <div className="mt-3 flex items-center gap-3">
              {provider.profileImage ? (
                <Image
                  src={provider.profileImage}
                  alt={`${provider.fullName} profile`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-white">
                  {getInitials(provider.fullName)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{provider.fullName}</p>
                  {verified ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 shadow-md" title="Verified">
                      <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--muted)]">{provider.primarySkill || "Service provider"}</p>
                {product.storeSlug ? (
                  <Link href={`/stores/${product.storeSlug}`} className="mt-1 inline-block text-xs font-semibold text-[var(--accent)] hover:underline">
                    Sold by {product.storeName || provider.fullName}
                  </Link>
                ) : null}
              </div>
              <div className="ml-auto flex flex-col items-end gap-2">
                {(() => {
                  const { displayScore, color } = formatCredibilityScore(provider.credibility);
                  return (
                    <span className={`rounded-md border ${color.bgClass} ${color.textClass} ${color.borderClass} px-2 py-1 text-xs font-semibold`}>
                      {displayScore}
                    </span>
                  );
                })()}
                <Link
                  href={`/discover/provider/${provider.id}`}
                  className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  View profile
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
