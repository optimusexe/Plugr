"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AnalyticsChannelBreakdown } from "@/lib/types";

const CHANNEL_COLORS: Record<string, string> = {
  call: "var(--accent)",
  whatsapp: "var(--accent-2)",
  email: "var(--accent-3)",
};

const CHANNEL_LABELS: Record<string, string> = {
  call: "Phone Call",
  whatsapp: "WhatsApp",
  email: "Email",
};

export function ChannelBreakdown({ data }: { data: AnalyticsChannelBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[var(--muted)]">
        No contact data yet.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: CHANNEL_LABELS[d.channel] || d.channel,
    value: d.count,
    channel: d.channel,
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.channel}
                fill={CHANNEL_COLORS[entry.channel] || "#94a3b8"}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.channel} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CHANNEL_COLORS[d.channel] || "#94a3b8" }}
            />
            <span className="text-sm">{CHANNEL_LABELS[d.channel] || d.channel}</span>
            <span className="text-sm font-semibold">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
