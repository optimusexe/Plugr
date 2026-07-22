import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { HelpCenterHub } from "@/components/help/help-center-hub";
import { LiveChatWidget } from "@/components/support/live-chat-widget";
import { helpArticles, helpFaqs, supportLinks } from "@/lib/help-data";
import { BreadcrumbSchema, FAQSchema } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Help Center - Plugr | Get Support & Answers",
  description:
    "Get help with Plugr. Find answers to common questions, learn how to use the platform, and contact our support team.",
  alternates: {
    canonical: "https://useplugr.app/help",
  },
  openGraph: {
    title: "Help Center - Plugr",
    description: "Get help with Plugr. Find answers and connect with our support team.",
    type: "website",
    url: "https://useplugr.app/help",
  },
};

export default function HelpCenterPage() {
  return (
    <>
      {FAQSchema(helpFaqs.map((f) => ({ question: f.question, answer: f.answer })))}
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Help Center", url: "https://useplugr.app/help" },
      ])}
      <main className="page-shell px-5 pt-4 sm:px-8 lg:px-16">
        <AppHeader />
        <HelpCenterHub articles={helpArticles} faqs={helpFaqs} supportLinks={supportLinks} />
        <LiveChatWidget />
      </main>
    </>
  );
}
