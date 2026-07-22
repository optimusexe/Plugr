import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { FaqPage } from "@/components/help/faq-page";
import { LiveChatWidget } from "@/components/support/live-chat-widget";
import { helpFaqs } from "@/lib/help-data";
import { BreadcrumbSchema, FAQSchema } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "FAQ - Plugr Help Center",
  description: "Frequently asked questions about Plugr. Quick answers to common questions about credibility, verification, discovery, and more.",
  alternates: {
    canonical: "https://useplugr.app/help/faq",
  },
  openGraph: {
    title: "FAQ - Plugr Help Center",
    description: "Frequently asked questions about Plugr.",
    type: "website",
    url: "https://useplugr.app/help/faq",
  },
};

export default function HelpFaqPage() {
  return (
    <>
      {FAQSchema(helpFaqs.map((f) => ({ question: f.question, answer: f.answer })))}
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Help Center", url: "https://useplugr.app/help" },
        { name: "FAQ", url: "https://useplugr.app/help/faq" },
      ])}
      <main className="page-shell px-5 pt-4 sm:px-8 lg:px-16">
        <AppHeader />
        <FaqPage faqs={helpFaqs} />
        <LiveChatWidget />
      </main>
    </>
  );
}
