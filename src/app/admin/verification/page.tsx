import Link from "next/link";
import { AdminMutationButton } from "@/components/admin/admin-mutation-button";
import { getAdminVerificationQueue } from "@/lib/admin-store";

function renderProgress(width: number): string {
  return `${Math.max(0, Math.min(100, width))}%`;
}

export default async function AdminVerificationPage() {
  const queue = await getAdminVerificationQueue();

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Approvals</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Verification review</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Review pending badge applications, inspect profile completion, and approve trusted users.
        </p>
      </header>

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-[var(--muted)] shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
            No pending verification requests right now.
          </div>
        ) : (
          queue.map(({ user, profile, progress }) => (
            <article key={profile.id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Pending badge</p>
                  <h2 className="mt-1 text-2xl font-semibold">{profile.fullName}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
                </div>
                <div className="rounded-2xl bg-[var(--card)] px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Completion</p>
                  <p className="mt-1 text-2xl font-semibold">{progress.percentageComplete}%</p>
                  <p className="text-xs text-[var(--muted)]">
                    {progress.completedChecks}/{progress.totalChecks} checks
                  </p>
                </div>
              </div>

              <div className="mt-4 h-3 rounded-full bg-black/5">
                <div className="h-3 rounded-full bg-[var(--accent)]" style={{ width: renderProgress(progress.percentageComplete) }} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {progress.checks.map((check) => (
                  <span
                    key={check.id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      check.completed ? "bg-emerald-100 text-emerald-700" : "bg-black/5 text-black/60"
                    }`}
                  >
                    {check.description}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <AdminMutationButton
                  endpoint="/api/admin/verification"
                  payload={{ userId: user.id, approved: true }}
                  label="Approve badge"
                  busyLabel="Approving..."
                />
                <AdminMutationButton
                  endpoint="/api/admin/verification"
                  payload={{ userId: user.id, approved: false }}
                  label="Keep pending"
                  busyLabel="Saving..."
                  className="rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-black/5"
                />
                <Link href={`/discover/provider/${profile.id}`} className="text-sm font-semibold text-[var(--accent)]">
                  View public profile
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}