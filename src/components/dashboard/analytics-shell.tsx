"use client";

import { useEffect, useState } from "react";
import { OverviewCards } from "./overview-cards";
import { TrendsChart } from "./trends-chart";
import { ChannelBreakdown } from "./channel-breakdown";
import { RatingDistribution } from "./rating-distribution";
import { CredibilityBreakdown } from "./credibility-breakdown";

import type {
  AnalyticsOverview,
  AnalyticsTrendPoint,
  AnalyticsChannelBreakdown,
  AnalyticsRatingDistribution,
  AnalyticsPeakHour,
  AnalyticsInteractionsByStatus,
} from "@/lib/types";

type AnalyticsData = {
  overview: AnalyticsOverview;
  trends: AnalyticsTrendPoint[];
  channels: AnalyticsChannelBreakdown[];
  ratings: AnalyticsRatingDistribution[];
  peakHours: AnalyticsPeakHour[];
  byStatus: AnalyticsInteractionsByStatus[];
};

export function AnalyticsShell(_props: { providerId: string }) {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetch(`/api/provider/analytics/overview?period=${period}`).then((r) => r.json()),
      fetch(`/api/provider/analytics/trends?days=${period}`).then((r) => r.json()),
      fetch(`/api/provider/analytics/interactions?period=${period}`).then((r) => r.json()),
    ])
      .then(([overviewRes, trendsRes, interactionsRes]) => {
        if (cancelled) return;
        if (overviewRes.error || trendsRes.error || interactionsRes.error) {
          setError(overviewRes.error || trendsRes.error || interactionsRes.error);
          setLoading(false);
          return;
        }
        setData({
          overview: overviewRes.overview,
          trends: trendsRes.trends,
          channels: interactionsRes.channels,
          ratings: interactionsRes.ratings,
          peakHours: interactionsRes.peakHours,
          byStatus: interactionsRes.byStatus,
        });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load analytics data.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Dashboard</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Provider Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">Loading your analytics data...</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Dashboard</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Provider Analytics</h1>
        </header>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error || "No data available."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        <header className="flex-1 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Provider Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            Track your profile performance, views, contacts, and credibility score.
          </p>
        </header>
      </div>

      <OverviewCards overview={data.overview} />

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Trends</p>
            <h2 className="mt-1 text-xl font-semibold">Activity over time</h2>
          </div>
          <div className="flex gap-1.5">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  period === d
                    ? "bg-[var(--accent)] text-white"
                    : "border border-black/10 bg-white text-[var(--muted)] hover:bg-black/5"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <TrendsChart data={data.trends} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Contact channels</p>
          <h2 className="mt-1 text-xl font-semibold">How people reach you</h2>
          <div className="mt-4">
            <ChannelBreakdown data={data.channels} />
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Ratings</p>
          <h2 className="mt-1 text-xl font-semibold">Review distribution</h2>
          <div className="mt-4">
            <RatingDistribution data={data.ratings} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Credibility</p>
        <h2 className="mt-1 text-xl font-semibold">Score breakdown</h2>
        <div className="mt-4">
          <CredibilityBreakdown credibility={data.overview.credibilityScore} />
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Interactions</p>
        <h2 className="mt-1 text-xl font-semibold">By status</h2>
        <div className="mt-4 space-y-3">
          {data.byStatus.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <span className="text-sm capitalize">{item.status.replace(/_/g, " ")}</span>
              <span className="text-sm font-semibold">{item.count}</span>
            </div>
          ))}
          {data.byStatus.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No interactions yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Retention</p>
        <h2 className="mt-1 text-xl font-semibold">Repeat customer rate</h2>
        <div className="mt-4">
          <p className="text-4xl font-semibold">{data.overview.repeatCustomerRate}%</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            of your customers have contacted you more than once
          </p>
        </div>
      </div>
    </section>
  );
}
