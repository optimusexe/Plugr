"use client";

type CredibilityData = {
  total: number;
  profileSetup: number;
  verification: number;
  reviews: number;
};

const SEGMENTS = [
  { key: "profileSetup" as const, label: "Profile Setup", max: 30, color: "var(--accent)" },
  { key: "verification" as const, label: "Verification", max: 20, color: "var(--accent-2)" },
  { key: "reviews" as const, label: "Reviews", max: 50, color: "var(--accent-3)" },
];

export function CredibilityBreakdown({ credibility }: { credibility: CredibilityData }) {
  return (
    <div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-semibold">{credibility.total.toFixed(1)}</span>
        <span className="text-sm text-[var(--muted)] mb-1">/ 100</span>
      </div>

      <div className="overflow-hidden rounded-full bg-black/5 h-4 mb-6">
        <div className="flex h-full">
          {SEGMENTS.map((seg) => {
            const pct = (credibility[seg.key] / 100) * 100;
            return (
              <div
                key={seg.key}
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                className="h-full transition-all duration-500"
              />
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className="rounded-xl border border-black/10 bg-[var(--card)] p-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{seg.label}</span>
            </div>
            <p className="mt-1 text-xl font-semibold">
              {credibility[seg.key].toFixed(1)}
              <span className="text-xs text-[var(--muted)]"> / {seg.max}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
