"use client";

import { useState } from "react";

export function AdminNotificationBroadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [userIds, setUserIds] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          actionUrl: actionUrl || undefined,
          target,
          userIds: target === "specific" ? userIds.split(",").map((value) => value.trim()).filter(Boolean) : undefined,
        }),
      });

      const data = (await response.json()) as { error?: string; recipientCount?: number };

      if (!response.ok) {
        throw new Error(data.error || "Unable to send notification.");
      }

      setSuccess(`Notification sent to ${data.recipientCount || 0} users.`);
      setTitle("");
      setMessage("");
      setActionUrl("");
      setUserIds("");
      setTarget("all");
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Broadcast</p>
      <h2 className="mt-1 text-xl font-semibold">Send notifications to users</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Use this to send welcome updates, feature announcements, or other platform-wide messages.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Notification title"
          className="w-full rounded-xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm"
          required
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Notification message"
          rows={4}
          className="w-full rounded-xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm"
          required
        />
        <input
          value={actionUrl}
          onChange={(event) => setActionUrl(event.target.value)}
          placeholder="Action URL (optional)"
          className="w-full rounded-xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value as "all" | "specific")}
            className="rounded-xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm"
          >
            <option value="all">All users</option>
            <option value="specific">Specific users</option>
          </select>
          {target === "specific" ? (
            <input
              value={userIds}
              onChange={(event) => setUserIds(event.target.value)}
              placeholder="User IDs separated by commas"
              className="rounded-xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm"
              required
            />
          ) : (
            <div className="rounded-xl border border-dashed border-black/10 px-4 py-3 text-sm text-[var(--muted)]">
              Broadcast to every active user.
            </div>
          )}
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Sending..." : "Send notification"}
        </button>
      </form>
    </section>
  );
}
