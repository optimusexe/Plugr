import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings - Plugr | Manage Your Account",
  description:
    "Manage your Plugr account settings. Change your password, update your email, or delete your account securely.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
