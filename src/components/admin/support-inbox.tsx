"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { SupportConversation, SupportConversationSummary, SupportMessage } from "@/lib/types";

type InboxResponse = {
  conversations: SupportConversationSummary[];
  adminUser?: { id: string; fullName: string };
};

type ThreadResponse = {
  conversation: SupportConversation | null;
  messages: SupportMessage[];
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function timeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const hours = Math.round(diffMinutes / 60);
  return `${hours}h ago`;
}

export function SupportInbox() {
  const [conversations, setConversations] = useState<SupportConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.conversation.id === selectedId) ?? conversations[0] ?? null,
    [conversations, selectedId],
  );

  async function loadInbox(signal?: AbortSignal) {
    try {
      const response = await fetch("/api/admin/support/conversations", { credentials: "include", signal });
      if (!response.ok) {
        throw new Error("Unable to load support inbox.");
      }

      const data = (await response.json()) as InboxResponse;
      setConversations(data.conversations);
      setSelectedId((current) => current ?? data.conversations[0]?.conversation.id ?? null);
      setError(null);
    } catch (requestError) {
      if ((requestError as DOMException).name !== "AbortError") {
        setError((requestError as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadThread(conversationId: string, signal?: AbortSignal) {
    try {
      const response = await fetch(`/api/admin/support/conversations/${conversationId}/messages`, { credentials: "include", signal });
      if (!response.ok) {
        throw new Error("Unable to load conversation.");
      }

      const data = (await response.json()) as ThreadResponse;
      setMessages(data.messages);
    } catch (requestError) {
      if ((requestError as DOMException).name !== "AbortError") {
        setError((requestError as Error).message);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadInbox(controller.signal);

    const interval = window.setInterval(() => {
      void loadInbox(controller.signal);
    }, 15000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const controller = new AbortController();
    void loadThread(selectedConversation.conversation.id, controller.signal);

    const interval = window.setInterval(() => {
      void loadThread(selectedConversation.conversation.id, controller.signal);
    }, 10000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [selectedConversation?.conversation.id]);

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversation || selectedConversation.conversation.status === "closed" || !reply.trim()) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/admin/support/conversations/${selectedConversation.conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: reply }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to send reply.");
      }

      const data = (await response.json()) as ThreadResponse;
      setMessages(data.messages);
      setReply("");
      await loadInbox();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function handleCloseConversation() {
    if (!selectedConversation) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/support/conversations/${selectedConversation.conversation.id}/close`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to close conversation.");
      }

      await loadInbox();
      await loadThread(selectedConversation.conversation.id);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  const selectedSummary = selectedConversation ?? null;

  return (
    <section className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
      <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Support inbox</p>
            <h2 className="mt-1 text-2xl font-semibold">Live conversations</h2>
          </div>
          <p className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--muted)]">{conversations.length} thread{conversations.length === 1 ? "" : "s"}</p>
        </div>

        <div className="mt-4 space-y-3">
          {loading && conversations.length === 0 ? <div className="rounded-2xl bg-[var(--card)] p-4 text-sm text-[var(--muted)]">Loading support inbox...</div> : null}

          {conversations.map((item) => {
            const active = item.conversation.id === selectedConversation?.conversation.id;
            const statusTone =
              item.conversation.status === "waiting_admin"
                ? "bg-amber-100 text-amber-700"
                : item.conversation.status === "waiting_user"
                  ? "bg-emerald-100 text-emerald-700"
                  : item.conversation.status === "closed"
                    ? "bg-black/5 text-black/60"
                    : "bg-[var(--accent)]/10 text-[var(--accent)]";

            return (
              <button
                key={item.conversation.id}
                type="button"
                onClick={() => setSelectedId(item.conversation.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-[var(--accent)] bg-[var(--card)]" : "border-black/10 bg-white hover:border-[var(--accent)]/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{item.profile?.fullName || item.user?.fullName || "Student"}</p>
                    <p className="text-xs text-[var(--muted)]">{item.user?.email || item.conversation.userId}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusTone}`}>{item.conversation.status.replace("_", " ")}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.conversation.subject}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                  <span>{item.lastMessage ? item.lastMessage.body.slice(0, 60) : "No messages yet"}</span>
                  <span>{item.lastMessage ? timeAgo(item.lastMessage.createdAt) : timeAgo(item.conversation.createdAt)}</span>
                </div>
              </button>
            );
          })}

          {!loading && conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
              No live chat requests yet. Users who open the help center chat widget will appear here.
            </div>
          ) : null}
        </div>
      </aside>

      <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
        {!selectedSummary ? (
          <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-black/15 bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
            Select a conversation to reply.
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Conversation</p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedSummary.profile?.fullName || selectedSummary.user?.fullName || "Student"}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{selectedSummary.user?.email || selectedSummary.conversation.userId} · {selectedSummary.conversation.subject}</p>
              </div>
              <div className="rounded-2xl bg-[var(--card)] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Status</p>
                <p className="mt-1 text-sm font-semibold capitalize">{selectedSummary.conversation.status.replace("_", " ")}</p>
                <p className="text-xs text-[var(--muted)]">Updated {formatTimestamp(selectedSummary.conversation.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs leading-6 text-[var(--muted)]">
                {selectedSummary.conversation.status === "closed"
                  ? "This conversation is closed. You can review the history or close the tab."
                  : "When you reply, the user will see it in the live chat widget."}
              </p>
              {selectedSummary.conversation.status !== "closed" ? (
                <button
                  type="button"
                  onClick={handleCloseConversation}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]"
                >
                  Close conversation
                </button>
              ) : null}
            </div>
            <div className="mt-4 h-px bg-black/10" />

            <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--card)] p-4">
              {messages.map((message) => {
                const isSystem = message.senderRole === "system";
                const isAdmin = message.senderRole === "admin";
                const bubbleClass = isSystem
                  ? "mx-auto max-w-[90%] rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900"
                  : isAdmin
                    ? "mr-auto max-w-[84%] rounded-2xl bg-white px-3 py-2 text-sm text-[var(--ink)] shadow-sm"
                    : "ml-auto max-w-[84%] rounded-2xl bg-[var(--accent)] px-3 py-2 text-sm text-white shadow-sm";

                return (
                  <div key={message.id} className={bubbleClass}>
                    <p className={isSystem ? "" : "whitespace-pre-wrap"}>{message.body}</p>
                    <p className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${isSystem ? "text-amber-700" : isAdmin ? "text-black/40" : "text-white/75"}`}>
                      {isSystem ? "System" : isAdmin ? "Customer care" : "User"} · {formatTimestamp(message.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleReply} className="space-y-3 border-t border-black/10 bg-white p-4">
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                placeholder="Type the reply you want customer care to send..."
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs leading-6 text-[var(--muted)]">Replies show up in the user widget in near real time through polling.</p>
                <button type="submit" disabled={sending} className="rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {sending ? "Sending..." : "Send reply"}
                </button>
              </div>
              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            </form>
          </div>
        )}
      </section>
    </section>
  );
}
