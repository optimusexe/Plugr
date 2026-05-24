import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications - Plugr",
  description: "View in-app notifications from Plugr, including welcome messages, feature updates, and admin announcements.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
