"use client";

import type { AnalyticsOverview } from "@/lib/types";

function TrendIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-[var(--muted)]">No change</span>;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
      <svg className={`h-3 w-3 ${isPositive ? "" : "rotate-180"}`} viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 2l4 5H2z" />
      </svg>
      {isPositive ? "+" : ""}{value}% vs last period
    </span>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group/tooltip relative inline-flex cursor-help">
      <svg className="h-4 w-4 text-black/30 transition-colors group-hover/tooltip:text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-52 rounded-lg border border-black/10 bg-white p-2.5 text-xs leading-relaxed text-[var(--ink)] shadow-lg opacity-0 transition-opacity group-hover/tooltip:opacity-100">
        {text}
      </span>
    </span>
  );
}

function MetricCard({ label, value, trend, info }: { label: string; value: string; trend: number; info: string }) {
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
        <InfoTooltip text={info} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-semibold">{value}</p>
      </div>
      <div className="mt-1">
        <TrendIndicator value={trend} />
      </div>
    </article>
  );
}

export function OverviewCards({ overview }: { overview: AnalyticsOverview }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Profile Views"
        value={overview.profileViews.total.toLocaleString()}
        trend={overview.profileViews.trend}
        info="How many times other students viewed your profile page."
      />
      <MetricCard
        label="Contact Clicks"
        value={overview.contactClicks.total.toLocaleString()}
        trend={overview.contactClicks.trend}
        info="How many times someone clicked Call, WhatsApp, or Email to reach you."
      />
      <MetricCard
        label="Search Appearances"
        value={overview.searchAppearances.total.toLocaleString()}
        trend={overview.searchAppearances.trend}
        info="How many times you appeared in search results when students look for services."
      />
      <MetricCard
        label="Conversion Rate"
        value={`${overview.conversionRate.value}%`}
        trend={overview.conversionRate.trend}
        info="Percentage of profile views that turned into contact clicks. Higher means your profile convinces visitors to reach out."
      />
    </div>
  );
}
