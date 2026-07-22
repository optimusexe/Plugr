"use client";

import { useEffect, useState } from "react";

const WINDOWS = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function ActiveUsersCard() {
  const [window, setWindow] = useState("7d");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/active-users?window=${window}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setCount(data.count ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCount(0);
        }
      });

    return () => { cancelled = true; };
  }, [window]);

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Active users</p>
        <div className="flex gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => setWindow(w.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                window === w.value
                  ? "bg-[var(--accent)] text-white"
                  : "bg-black/5 text-[var(--muted)] hover:bg-black/10"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold">
        {count === null ? "—" : formatNumber(count)}
      </p>
    </article>
  );
}
