import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Setup - Plugr",
  description: "Set up your Plugr profile with your skills, location, and service offerings.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProfileSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
