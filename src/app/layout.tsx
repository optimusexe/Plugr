import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { OrganizationSchema } from "@/lib/json-ld";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Plugr - Campus Talent Map",
  description: "Find the talent. Be the talent. The all-in-one discovery layer for professionals on campus.",
  keywords: ["campus", "talent", "marketplace", "skills", "professionals", "networking"],
  metadataBase: new URL("https://useplugr.app"),
  icons: {
    icon: "/plugr.png",
    shortcut: "/plugr.png",
    apple: "/plugr.png",
  },
  openGraph: {
    type: "website",
    url: "https://useplugr.app",
    title: "Plugr - Campus Talent Map",
    description: "Find the talent. Be the talent. The all-in-one discovery layer for professionals on campus.",
    siteName: "Plugr",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Plugr - Campus Talent Map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@useplugr",
    creator: "@useplugr",
    title: "Plugr - Campus Talent Map",
    description: "Find the talent. Be the talent. The all-in-one discovery layer for professionals on campus.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} pt-24`}>
        <OrganizationSchema />
        {children}
      </body>
    </html>
  );
}
