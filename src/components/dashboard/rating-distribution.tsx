"use client";

import type { AnalyticsRatingDistribution } from "@/lib/types";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? "fill-[var(--accent-2)]" : "fill-black/10"}`}
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function RatingDistribution({ data }: { data: AnalyticsRatingDistribution[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {[...data].reverse().map((item) => (
        <div key={item.rating} className="flex items-center gap-3">
          <div className="flex items-center gap-1" style={{ minWidth: "80px" }}>
            <span className="text-sm font-semibold w-4 text-right">{item.rating}</span>
            <StarIcon filled={true} />
          </div>
          <div className="flex-1 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-2 rounded-full bg-[var(--accent-2)] transition-all duration-500"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm font-semibold">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
