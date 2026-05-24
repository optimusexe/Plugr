import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Auth - Plugr | Register or Login",
    description: "Sign in to your Plugr account or register for free to start connecting with students on campus.",
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
