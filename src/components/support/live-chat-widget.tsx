"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import type { SupportConversation, SupportMessage } from "@/lib/types";

type SupportApiResponse = {
  conversation: SupportConversation | null;
  messages: SupportMessage[];
  user?: { fullName?: string } | null;
  profile?: { fullName?: string } | null;
};

type ComposerState = {
  subject: string;
  message: string;
};

const INITIAL_COMPOSER: ComposerState = {
  subject: "Live chat support",
  message: "",
};

function formatClock(value: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function getFirstName(fullName?: string | null): string {
  const trimmedName = fullName?.trim();
  if (!trimmedName) {
    return "there";
  }

  return trimmedName.split(/\s+/)[0] || "there";
}

export function LiveChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [greetingName, setGreetingName] = useState("there");
  const [composer, setComposer] = useState<ComposerState>(INITIAL_COMPOSER);
  const [queuedSubject, setQueuedSubject] = useState<string | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isHidden = useMemo(() => pathname.startsWith("/admin") || pathname.startsWith("/auth"), [pathname]);

  useEffect(() => {
    function handleOpen(event: Event) {
      const customEvent = event as CustomEvent<{ subject?: string; message?: string }>;
      setQueuedSubject(customEvent.detail?.subject ?? null);
      setQueuedMessage(customEvent.detail?.message ?? null);
      setOpen(true);
    }

    window.addEventListener("plugr:support-chat-open", handleOpen as EventListener);
    return () => window.removeEventListener("plugr:support-chat-open", handleOpen as EventListener);
  }, []);

  useEffect(() => {
    if (queuedSubject || queuedMessage) {
      setComposer((prev) => ({
        subject: queuedSubject ?? prev.subject,
        message: queuedMessage ?? prev.message,
      }));
      setQueuedSubject(null);
      setQueuedMessage(null);
    }
  }, [queuedMessage, queuedSubject]);

  async function loadConversation(signal?: AbortSignal, showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/support/conversations", { credentials: "include", signal });
      if (response.status === 401) {
        setConversation(null);
        setMessages([]);
        setError("Please log in to start live chat support.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load your chat thread.");
      }

      const data = (await response.json()) as SupportApiResponse;
      setConversation(data.conversation);
      setMessages(data.messages);
      setGreetingName(getFirstName(data.profile?.fullName ?? data.user?.fullName));

      if (data.conversation?.subject) {
        setComposer((prev) => ({ ...prev, subject: data.conversation?.subject || prev.subject }));
      }
    } catch (requestError) {
      if ((requestError as DOMException).name !== "AbortError") {
        setError((requestError as Error).message);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!open || isHidden) {
      return;
    }

    const controller = new AbortController();
    void loadConversation(controller.signal);

    const interval = window.setInterval(() => {
      void loadConversation(controller.signal, false);
    }, 4000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [isHidden, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = composer.message.trim();
    if (!message) {
      setError("Enter a message to start chatting.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = conversation
        ? await fetch(`/api/support/conversations/${conversation.id}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ message }),
          })
        : await fetch("/api/support/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ subject: composer.subject, message }),
          });

      if (response.status === 401) {
        setGreetingName("there");
        setError("Please log in to start live chat support.");
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to send message.");
      }

      const data = (await response.json()) as SupportApiResponse;
      setConversation(data.conversation);
      setMessages(data.messages);
      setGreetingName(getFirstName(data.profile?.fullName ?? data.user?.fullName));
      setComposer((prev) => ({ ...prev, message: "", subject: data.conversation?.subject || prev.subject }));
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function handleCloseConversation() {
    if (!conversation) {
      setOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/support/conversations/${conversation.id}/close`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to close conversation.");
      }

      setConversation(null);
      setMessages([]);
      setComposer(INITIAL_COMPOSER);
      setError(null);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  function openComposer() {
    setOpen(true);
  }

  if (isHidden) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={openComposer}
        className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(15,25,20,0.22)] transition hover:-translate-y-0.5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg">💬</span>
        Live chat
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-[70] w-[min(92vw,420px)] overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,25,20,0.24)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-[linear-gradient(135deg,var(--accent),#0b5f58)] p-4 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Customer care</p>
              <h2 className="mt-1 text-lg font-semibold">Live support</h2>
              <p className="mt-1 text-xs leading-6 text-white/75">Responses may take a minute when the queue is busy.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {conversation ? (
                <button type="button" onClick={handleCloseConversation} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                  End chat
                </button>
              ) : null}
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                Close
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="max-h-[420px] space-y-3 overflow-y-auto bg-[var(--card)] p-4">
            {loading && messages.length === 0 ? <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">Loading your chat thread...</div> : null}

            {!conversation ? (
              <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-4 text-sm text-[var(--muted)]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Hi {greetingName}</p>
                  <p className="text-lg font-semibold text-[var(--ink)]">How can we help?</p>
                </div>
                <div className="rounded-2xl bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
                  <p className="font-semibold text-[var(--ink)]">Send us a message</p>
                  <p className="mt-1">We typically reply in a few minutes or less.</p>
                </div>
                <p>Need to sign in first? <Link href="/auth?mode=login" className="font-semibold text-[var(--accent)]">Open login</Link>.</p>
              </div>
            ) : null}

            {messages.map((message) => {
              const isSystem = message.senderRole === "system";
              const isAdmin = message.senderRole === "admin";
              const bubbleClass = isSystem
                ? "mx-auto max-w-[92%] rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900"
                : isAdmin
                  ? "mr-auto max-w-[86%] rounded-2xl bg-white px-3 py-2 text-sm text-[var(--ink)] shadow-sm"
                  : "ml-auto max-w-[86%] rounded-2xl bg-[var(--accent)] px-3 py-2 text-sm text-white shadow-sm";

              return (
                <div key={message.id} className={bubbleClass}>
                  <p className={isSystem ? "" : "whitespace-pre-wrap"}>{message.body}</p>
                  <p className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${isSystem ? "text-amber-700" : isAdmin ? "text-black/40" : "text-white/75"}`}>
                    {isSystem ? "System" : isAdmin ? "Customer care" : "You"} · {formatClock(message.createdAt)}
                  </p>
                </div>
              );
            })}

            {conversation?.status === "waiting_admin" ? (
              <div className="rounded-2xl border border-dashed border-[var(--accent)]/30 bg-white p-4 text-xs leading-6 text-[var(--muted)]">
                Customer care is reviewing your message. If the queue is busy, we’ll post a delay update after about a minute.
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSend} className="space-y-3 border-t border-black/10 bg-white p-4">
            <textarea
              value={composer.message}
              onChange={(event) => setComposer((prev) => ({ ...prev, message: event.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
              placeholder={conversation ? "Type a reply..." : "Tell us what you need help with..."}
            />
            <div className="flex items-center justify-between gap-3">
              <button type="submit" disabled={sending} className="rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {sending ? "Sending..." : conversation ? "Send reply" : "Start chat"}
              </button>
            </div>
            {conversation ? (
              <button
                type="button"
                onClick={handleCloseConversation}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]"
              >
                End conversation
              </button>
            ) : null}
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          </form>
        </div>
      ) : null}
    </>
  );
}
