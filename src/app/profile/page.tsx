import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { ProviderReviews } from "@/components/providers/provider-reviews";
import { getProfileByUserId } from "@/lib/profile-store";
import { getUserById } from "@/lib/auth-store";
import { formatCredibilityScore } from "@/lib/credibility-colors";

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "S";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default async function ProfilePage() {
  const userId = (await cookies()).get("plugr_user_id")?.value;
  if (!userId) {
    redirect("/auth?mode=login");
  }

  const [profile, user] = await Promise.all([getProfileByUserId(userId), getUserById(userId)]);

  if (!profile) {
    return (
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Profile</p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">Your profile is not complete</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Set up your details to appear in discovery.</p>
          <div className="mt-6">
            <Link
              href="/profile/setup"
              className="inline-flex rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Complete profile setup
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const displayEmail = profile.email || user?.email || "Not provided";
  const isVerified = profile.verificationStatus === "verified";

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Profile</p>
            <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">Your details</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">This is what other students see on your profile.</p>
          </div>
          <Link
            href="/profile/edit"
            className="inline-flex rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Edit profile
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-black/10 bg-white p-4">
          {profile.profileImage ? (
            <Image
              src={profile.profileImage}
              alt="Profile picture"
              width={88}
              height={88}
              className="h-22 w-22 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[var(--accent)] text-xl font-semibold text-white">
              {getInitials(profile.fullName)}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{profile.fullName}</h2>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                  <span aria-hidden="true">✓</span>
                  Verified
                </span>
              ) : null}
            </div>
            <p className="text-sm text-[var(--muted)]">{profile.primarySkill || "Skill not set"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Faculty</p>
            <p className="mt-1 text-sm font-semibold">{profile.faculty}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Department</p>
            <p className="mt-1 text-sm font-semibold">{profile.department}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Level</p>
            <p className="mt-1 text-sm font-semibold">{profile.level}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Campus location</p>
            <p className="mt-1 text-sm font-semibold">{profile.locationText}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Phone</p>
            <p className="mt-1 text-sm font-semibold">{profile.phone}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Email</p>
            <p className="mt-1 text-sm font-semibold">{displayEmail}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Mode</p>
            <p className="mt-1 text-sm font-semibold capitalize">{profile.mode}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Verification</p>
            <p className="mt-1 text-sm font-semibold capitalize">
              {profile.verificationStatus === "verified" ? "Verified badge active" : "Pending review"}
            </p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Credibility</p>
            {(() => {
              const { displayScore, color } = formatCredibilityScore(profile.credibility);
              return (
                <div className="mt-1 inline-flex">
                  <span className={`rounded-md border ${color.bgClass} ${color.textClass} ${color.borderClass} px-2 py-1 text-xs font-semibold`}>
                    {displayScore}
                  </span>
                </div>
              );
            })()}
          </article>
        </div>

        <article className="mt-3 rounded-xl border border-black/10 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Bio</p>
          <p className="mt-1 text-sm font-semibold">{profile.bio || "No bio added yet."}</p>
        </article>

        <article className="mt-3 rounded-xl border border-black/10 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Products</p>
          {profile.products && profile.products.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {profile.products.map((product) => (
                <div key={product.id} className="rounded-lg border border-black/10 bg-[var(--card)] p-3">
                  <div className="mb-2 overflow-hidden rounded-md border border-black/10 bg-white">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={640}
                        height={360}
                        loading="lazy"
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
            <p className="mt-1 text-sm font-semibold">No products uploaded yet.</p>
          )}
        </article>

        <ProviderReviews providerId={profile.id} showComposer={false} sectionTitle="Reviews from customers" />
      </section>
    </main>
  );
}
