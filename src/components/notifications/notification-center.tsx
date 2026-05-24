"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationSummary } from "@/lib/types";

type NotificationCenterProps = {
  userId: string;
  initialNotifications: NotificationSummary[];
};

type Filter = "all" | "unread" | "read";

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationCenter({ userId, initialNotifications }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<Filter>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const counts = useMemo(() => {
    return notifications.reduce(
      (accumulator, notification) => {
        if (notification.isRead) {
          accumulator.read += 1;
        } else {
          accumulator.unread += 1;
        }
        return accumulator;
      },
      { read: 0, unread: 0 },
    );
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "read") {
        return notification.isRead;
      }
      if (filter === "unread") {
        return !notification.isRead;
      }
      return true;
    });
  }, [filter, notifications]);

  async function markAsRead(notificationId: string) {
    setLoadingId(notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification,
        ),
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function openNotification(notification: NotificationSummary) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  }

  return (
    <section className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,25,20,0.08)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Inbox</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Notifications</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Stay up to date with welcome messages, feature drops, and admin announcements.</p>
        </div>
        <Link href="/discover" className="rounded-xl border border-black/10 bg-[var(--card)] px-4 py-2 text-sm font-semibold">
          Back to discover
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
        {[
          { value: "all", label: `All (${notifications.length})` },
          { value: "unread", label: `Unread (${counts.unread})` },
          { value: "read", label: `Read (${counts.read})` },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value as Filter)}
            className={`rounded-full px-4 py-2 transition ${
              filter === item.value ? "bg-[var(--accent)] text-white" : "bg-black/5 text-[var(--muted)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {visibleNotifications.length > 0 ? (
          visibleNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-4 ${notification.isRead ? "border-black/10 bg-white" : "border-[var(--accent)]/20 bg-[var(--card)]"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{notification.title}</h2>
                    <span className="rounded-full bg-black/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {notification.type.replace(/-/g, " ")}
                    </span>
                    {!notification.isRead ? (
                      <span className="rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{notification.message}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">{timeAgo(notification.createdAt)}</p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {notification.actionUrl ? (
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Open
                    </button>
                  ) : null}
                  {!notification.isRead ? (
                    <button
                      type="button"
                      disabled={loadingId === notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {loadingId === notification.id ? "Saving..." : "Mark read"}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-black/10 bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
            Nothing here yet.
          </div>
        )}
      </div>
    </section>
  );
}
