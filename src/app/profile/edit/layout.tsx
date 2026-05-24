import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile - Plugr",
  description: "Edit your Plugr profile information.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProfileEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
