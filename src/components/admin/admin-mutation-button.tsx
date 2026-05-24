"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminMutationButtonProps = {
  endpoint: string;
  payload: Record<string, unknown>;
  label: string;
  busyLabel?: string;
  className?: string;
};

export function AdminMutationButton({ endpoint, payload, label, busyLabel = "Working...", className }: AdminMutationButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to complete action.");
      }

      router.refresh();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={className ?? "rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-60"}
      >
        {busy ? busyLabel : label}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}