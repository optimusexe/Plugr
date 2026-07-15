import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { DirectionsPanel } from "@/components/maps/directions-panel";
import { ProviderContactActions } from "@/components/providers/provider-contact-actions";
import { ProviderReviews } from "@/components/providers/provider-reviews";
import { getProfileById, incrementProfileViews } from "@/lib/profile-store";
import { formatCredibilityScore } from "@/lib/credibility-colors";
import { BreadcrumbSchema, WebPageSchema } from "@/lib/json-ld";
import {
  getProviderSeoDescription,
  getProviderSeoTitle,
} from "@/lib/provider-seo";
import { recordAnalyticsEvent } from "@/lib/analytics-store";

type ProviderProfilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProviderProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const provider = await getProfileById(id);

  if (!provider) {
    return {
      title: "Provider not found - Plugr",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = getProviderSeoTitle(provider);
  const description = getProviderSeoDescription(provider);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://useplugr.app/discover/provider/${provider.id}`,
      images: [
        {
          url: `/discover/provider/${provider.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${provider.fullName} on Plugr`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/discover/provider/${provider.id}/opengraph-image`],
    },
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "S";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default async function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const userId = (await cookies()).get("plugr_user_id")?.value;

  const { id } = await params;
  const provider = await getProfileById(id);
  if (!provider) {
    notFound();
  }

  // Track profile view (fire-and-forget)
  recordAnalyticsEvent({
    providerId: provider.id,
    eventType: "profile_view",
    visitorId: userId ?? undefined,
  }).catch(() => undefined);

  // Increment view count (fire-and-forget)
  incrementProfileViews(provider.id).catch(() => undefined);

  const isOwnProfile = provider.userId === userId;
  const showComposer = Boolean(userId) && !isOwnProfile;

  const productsPreview = provider.products ? provider.products.slice(0, 2) : [];
  const hasMoreProducts = (provider.products?.length || 0) > 2;

  return (
    <>
      {WebPageSchema(getProviderSeoTitle(provider), getProviderSeoDescription(provider))}
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Discover", url: "https://useplugr.app/discover" },
        { name: provider.fullName, url: `https://useplugr.app/discover/provider/${provider.id}` },
      ])}
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:p-8">
        <div className="mb-5">
          <Link href="/discover" className="inline-flex rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold">
            Back to feed
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/10 bg-white p-4">
          {provider.profileImage ? (
            <Image
              src={provider.profileImage}
              alt={`${provider.fullName} profile`}
              width={96}
              height={96}
              unoptimized
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent)] text-2xl font-semibold text-white">
              {initialsFromName(provider.fullName)}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Provider profile</p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-[var(--font-display)] text-3xl font-bold">{provider.fullName}</h1>
              {provider.verificationStatus === "verified" ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg" title="Verified">
                  <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{provider.primarySkill || "Service provider"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Skill</p>
            <p className="mt-1 text-sm font-semibold">{provider.primarySkill || "Not specified"}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Location</p>
            <p className="mt-1 text-sm font-semibold">{provider.locationText}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Faculty</p>
            <p className="mt-1 text-sm font-semibold">{provider.faculty}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Department & Level</p>
            <p className="mt-1 text-sm font-semibold">
              {provider.department} • {provider.level}
            </p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Credibility</p>
            {(() => {
              const { displayScore, color } = formatCredibilityScore(provider.credibility);
              return (
                <div className="mt-1 inline-flex">
                  <span className={`rounded-md border ${color.bgClass} ${color.textClass} ${color.borderClass} px-2 py-1 text-xs font-semibold`}>
                    {displayScore}
                  </span>
                </div>
              );
            })()}
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Bio</p>
            <p className="mt-1 text-sm font-semibold">{provider.bio || "No bio provided yet."}</p>
          </article>
        </div>

        <article className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Products</p>
            {hasMoreProducts ? (
              <Link
                href={`/discover/provider/${provider.id}/products`}
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                See more
              </Link>
            ) : null}
          </div>
          {productsPreview.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {productsPreview.map((product) => (
                <div key={product.id} className="rounded-lg border border-black/10 bg-[var(--card)] p-3">
                  <div className="mb-2 overflow-hidden rounded-md border border-black/10 bg-white">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={640}
                        height={360}
                        unoptimized
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center text-xs text-[var(--muted)]">
                        No product image
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold">{product.name}</p>
                  {product.price ? <p className="text-xs text-[var(--muted)]">Price: {product.price}</p> : null}
                  {product.description ? <p className="mt-1 text-xs text-[var(--muted)]">{product.description}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">No products uploaded yet.</p>
          )}
        </article>

        <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Contact and communication</p>
          <ProviderContactActions providerId={provider.id} phone={provider.phone} email={provider.email} />
        </div>

        <DirectionsPanel destinationText={provider.locationText} mapLink={provider.mapLink} />
        <ProviderReviews providerId={provider.id} showComposer={showComposer} />
      </section>
    </main>
    </>
  );
}
