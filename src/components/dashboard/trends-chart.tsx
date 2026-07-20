"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AnalyticsTrendPoint } from "@/lib/types";

export function TrendsChart({ data }: { data: AnalyticsTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">
        No trend data available for this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          labelFormatter={(v) => {
            const d = new Date(v);
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="views" stroke="var(--accent)" strokeWidth={2} dot={false} name="Views" />
        <Line type="monotone" dataKey="contacts" stroke="var(--accent-2)" strokeWidth={2} dot={false} name="Contacts" />
        <Line type="monotone" dataKey="searchAppearances" stroke="var(--accent-3)" strokeWidth={2} dot={false} name="Search" />
      </LineChart>
    </ResponsiveContainer>
  );
}
