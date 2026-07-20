import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Verification - Plugr",
  robots: { index: false, follow: false },
};

export default function EmailVerificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
