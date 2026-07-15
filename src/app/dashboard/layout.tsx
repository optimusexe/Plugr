import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provider Dashboard - Plugr",
  description: "Track your profile performance, views, contacts, and credibility score.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
