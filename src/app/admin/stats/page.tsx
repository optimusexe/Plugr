import Link from "next/link";
import { getUsers } from "@/lib/auth-store";
import { getProfiles } from "@/lib/profile-store";
import { getAdminOverview } from "@/lib/admin-store";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function AdminStatsPage() {
  const [overview, users, profiles] = await Promise.all([getAdminOverview(), getUsers(), getProfiles()]);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Overview</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Platform stats</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Track user growth, verification activity, reviews, and the strongest providers on the platform.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: formatNumber(overview.totalUsers) },
          { label: "Admin accounts", value: formatNumber(overview.adminCount) },
          { label: "Email verified", value: formatNumber(overview.verifiedAccounts) },
          { label: "Badge verified", value: formatNumber(overview.badgeApprovedProfiles) },
          { label: "Pending badges", value: formatNumber(overview.pendingBadgeProfiles) },
          { label: "Provider rate", value: `${overview.metrics.verifiedProviderRate}%` },
          { label: "Provider profiles", value: formatNumber(overview.metrics.providerCount) },
          { label: "Active categories", value: formatNumber(overview.metrics.activeCategories) },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Recent signups</p>
              <h2 className="mt-1 text-xl font-semibold">Newest users</h2>
            </div>
            <Link href="/admin/users" className="text-sm font-semibold text-[var(--accent)]">
              View all users
            </Link>
          </div>

          <div className="mt-4 divide-y divide-black/10">
            {overview.recentUsers.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-[var(--muted)]">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={`rounded-full px-3 py-1 ${user.verified ? "bg-emerald-100 text-emerald-700" : "bg-black/5 text-black/60"}`}>
                    {user.verified ? "Email verified" : "Email pending"}
                  </span>
                  <span className={`rounded-full px-3 py-1 ${user.isAdmin ? "bg-[var(--accent)] text-white" : "bg-black/5 text-black/60"}`}>
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Top providers</p>
          <h2 className="mt-1 text-xl font-semibold">Highest credibility</h2>
          <div className="mt-4 space-y-3">
            {overview.topProviders.map((profile, index) => (
              <Link
                key={profile.id}
                href={`/discover/provider/${profile.id}`}
                className="block rounded-2xl border border-black/10 bg-[var(--card)] p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{profile.fullName}</p>
                    <p className="text-sm text-[var(--muted)]">{profile.primarySkill || "Service provider"}</p>
                  </div>
                  <p className="text-lg font-semibold">{Number(profile.credibility).toFixed(1)}</p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  #{index + 1} in credibility
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Recent reviews</p>
          <h2 className="mt-1 text-xl font-semibold">Latest customer feedback</h2>
          <div className="mt-4 space-y-3">
            {overview.recentReviews.map((review) => {
              const providerName = profilesById.get(review.providerId)?.fullName ?? review.providerId;
              const consumerName = usersById.get(review.consumerId)?.fullName ?? review.consumerId;

              return (
                <article key={review.id} className="rounded-2xl border border-black/10 bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{providerName}</p>
                    <p className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">{review.rating}/5</p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">From {consumerName}</p>
                  {review.comment ? <p className="mt-2 text-sm">{review.comment}</p> : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Recent interactions</p>
          <h2 className="mt-1 text-xl font-semibold">Activity feed</h2>
          <div className="mt-4 space-y-3">
            {overview.recentInteractions.map((interaction) => {
              const providerName = profilesById.get(interaction.providerId)?.fullName ?? interaction.providerId;
              const consumerName = usersById.get(interaction.consumerId)?.fullName ?? interaction.consumerId;

              return (
                <article key={interaction.id} className="rounded-2xl border border-black/10 bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{providerName}</p>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                      {interaction.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">Consumer: {consumerName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Channel: {interaction.contactChannel}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}