"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationSummary } from "@/lib/types";

type NotificationBellProps = {
  className?: string;
};

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

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = window.localStorage.getItem("plugr_user_id");
    setUserId(storedUserId);
    if (!storedUserId) {
      setLoading(false);
    }
  }, []);

  async function loadNotifications() {
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        notifications: NotificationSummary[];
        unreadCount: number;
      };

      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unreadCount || 0));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) {
      return;
    }

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 120000);
    return () => window.clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  async function markAsRead(notificationId: string) {
    if (!userId) {
      return;
    }

    await fetch(`/api/notifications/${notificationId}/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => undefined);

    await loadNotifications();
  }

  async function handleOpenNotification(notification: NotificationSummary) {
    await markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else {
      router.push("/notifications");
    }
    setOpen(false);
  }

  if (!userId) {
    return null;
  }

  return (
    <div ref={rootRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {loading ? null : unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_60px_rgba(15,25,20,0.16)]">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-[var(--muted)]">{unreadCount} unread</p>
            </div>
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-[var(--accent)]">
              View all
            </Link>
          </div>

          <div className="max-h-96 overflow-auto">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleOpenNotification(notification)}
                  className={`block w-full border-b border-black/5 px-4 py-3 text-left transition hover:bg-black/5 ${
                    notification.isRead ? "bg-white" : "bg-[var(--card)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{notification.message}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-[var(--muted)]">{timeAgo(notification.createdAt)}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-[var(--muted)]">No notifications yet.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
