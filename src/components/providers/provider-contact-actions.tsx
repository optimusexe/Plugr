"use client";

import { useState } from "react";

type ProviderContactActionsProps = {
  providerId: string;
  phone: string;
  email?: string;
};

async function trackInteraction(providerId: string, channel: "call" | "whatsapp" | "email") {
  await fetch("/api/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId, channel }),
  });
}

export function ProviderContactActions({ providerId, phone, email }: ProviderContactActionsProps) {
  const [tracking, setTracking] = useState(false);

  async function handleCall() {
    setTracking(true);
    await trackInteraction(providerId, "call").catch(() => undefined);
    setTracking(false);
    window.location.href = `tel:${phone}`;
  }

  async function handleWhatsApp() {
    setTracking(true);
    await trackInteraction(providerId, "whatsapp").catch(() => undefined);
    setTracking(false);
    const cleanPhone = phone.replace(/[^\d]/g, "");
    const message = encodeURIComponent("Hi, I'd like to connect with you on Plugr!");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  async function handleEmail() {
    if (!email) {
      return;
    }
    setTracking(true);
    await trackInteraction(providerId, "email").catch(() => undefined);
    setTracking(false);
    window.location.href = `mailto:${email}`;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCall}
        disabled={tracking}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {tracking ? "Starting..." : `Call ${phone}`}
      </button>
      <button
        type="button"
        onClick={handleWhatsApp}
        disabled={tracking}
        className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        Message on WhatsApp
      </button>
      {email ? (
        <button
          type="button"
          onClick={handleEmail}
          disabled={tracking}
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Send email
        </button>
      ) : null}
    </div>
  );
}
