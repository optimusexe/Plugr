import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ID Verification - Plugr",
  robots: { index: false, follow: false },
};

export default function IDVerificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
