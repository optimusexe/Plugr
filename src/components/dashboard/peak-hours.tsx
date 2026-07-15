"use client";

import type { AnalyticsPeakHour } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function PeakHours({ data }: { data: AnalyticsPeakHour[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[var(--muted)]">
        No interaction data yet.
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const grid = new Map<string, number>();
  for (const entry of data) {
    grid.set(`${entry.dayOfWeek}-${entry.hour}`, entry.count);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-1 mb-1">
          <div className="w-10" />
          {HOURS.filter((h) => h % 3 === 0).map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-[var(--muted)]">
              {h}h
            </div>
          ))}
        </div>
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex gap-1 mb-1">
            <div className="w-10 text-xs text-[var(--muted)] flex items-center">{day}</div>
            {HOURS.filter((h) => h % 3 === 0).map((hour) => {
              const count = grid.get(`${dayIdx}-${hour}`) || 0;
              const intensity = count / maxCount;
              return (
                <div
                  key={`${dayIdx}-${hour}`}
                  className="flex-1 aspect-square rounded-sm transition-colors"
                  style={{
                    backgroundColor:
                      count === 0
                        ? "rgba(0,0,0,0.03)"
                        : `rgba(15, 118, 110, ${0.15 + intensity * 0.85})`,
                  }}
                  title={`${day} ${hour}:00 - ${count} contacts`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
