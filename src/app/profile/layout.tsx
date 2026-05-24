import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Plugr",
  description:
    "View and manage your Plugr profile. See your credibility score, skills, location, and reviews.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
