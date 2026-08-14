import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getProfileById } from "@/lib/profile-store";
import { getProductsByProvider } from "@/lib/product-store";
import { BreadcrumbSchema, WebPageSchema } from "@/lib/json-ld";
import {
  getProviderSeoDescription,
  getProviderSeoTitle,
} from "@/lib/provider-seo";

type ProviderProductsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProviderProductsPageProps): Promise<Metadata> {
  const { id } = await params;
  const provider = await getProfileById(id);

  if (!provider) {
    return {
      title: "Products not found - Plugr",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${getProviderSeoTitle(provider)} | Products`;
  const description = getProviderSeoDescription(provider);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://useplugr.app/discover/provider/${provider.id}/products`,
      images: [
        {
          url: `/discover/provider/${provider.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${provider.fullName} products on Plugr`,
        },
      ],
    },
  };
}

export default async function ProviderProductsPage({ params }: ProviderProductsPageProps) {
  const { id } = await params;
  const provider = await getProfileById(id);
  if (!provider) {
    notFound();
  }

  const products = await getProductsByProvider(provider.id, 100);

  return (
    <>
      {WebPageSchema(`${provider.fullName} products on Plugr`, getProviderSeoDescription(provider))}
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Discover", url: "https://useplugr.app/discover" },
        { name: provider.fullName, url: `https://useplugr.app/discover/provider/${provider.id}` },
        { name: "Products", url: `https://useplugr.app/discover/provider/${provider.id}/products` },
      ])}
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <section className="mx-auto max-w-5xl rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Products</p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-[var(--font-display)] text-3xl font-bold">{provider.fullName}&apos;s products</h1>
              {provider.verificationStatus === "verified" ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg" title="Verified">
                  <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              ) : null}
            </div>
          </div>
          <Link
            href={`/discover/provider/${provider.id}`}
            className="inline-flex rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold"
          >
            Back to profile
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => {
              const image = product.imageUrls[0];
              return (
                <Link
                  key={product.id}
                  href={`/p/${product.id}`}
                  className="rounded-xl border border-black/10 bg-white p-4 transition hover:border-black/25"
                >
                  <div className="mb-3 overflow-hidden rounded-lg border border-black/10 bg-[var(--card)]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        width={800}
                        height={450}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-[var(--accent)] text-sm font-semibold text-white">
                        {product.name.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h2 className="text-base font-semibold">{product.name}</h2>
                  {product.price ? <p className="mt-1 text-sm text-[var(--muted)]">{product.price}</p> : null}
                  {product.description ? <p className="mt-2 text-sm text-[var(--muted)]">{product.description}</p> : null}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-black/10 bg-white p-5 text-sm text-[var(--muted)]">
            No products in their store yet.
          </div>
        )}
      </section>
    </main>
    </>
  );
}
