import Link from "next/link";
import { AdminNotificationBroadcast } from "@/components/admin/admin-notification-broadcast";
import { getRecentBroadcasts } from "@/lib/notification-store";
import { AdminMutationButton } from "@/components/admin/admin-mutation-button";

export default async function AdminNotificationsPage() {
  const broadcasts = await getRecentBroadcasts(12);

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Notifications</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Publish updates</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Send welcome messages, feature announcements, and other updates directly to users inside Plugr.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminNotificationBroadcast />

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Recent broadcasts</p>
              <h2 className="mt-1 text-xl font-semibold">Latest messages sent</h2>
            </div>
            <Link href="/admin/stats" className="text-sm font-semibold text-[var(--accent)]">
              Back to stats
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {broadcasts.length > 0 ? (
              broadcasts.map((notification) => (
                <article key={notification.broadcastId} className="rounded-2xl border border-black/10 bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{notification.recipientCount} recipient{notification.recipientCount === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        {notification.type.replace(/-/g, " ")}
                      </span>
                      <AdminMutationButton
                        endpoint={`/api/admin/notifications/${notification.broadcastId}`}
                        method="DELETE"
                        payload={{}}
                        label="Delete"
                        busyLabel="Deleting..."
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{notification.message}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">{new Date(notification.createdAt).toLocaleString()}</p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-black/10 bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
                No broadcasts have been sent yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
