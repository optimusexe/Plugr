import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HelpCenterHub } from "@/components/help/help-center-hub";
import { LiveChatWidget } from "@/components/support/live-chat-widget";
import { BreadcrumbSchema } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Help Center - Plugr | Get Support & Answers",
  description:
    "Get help with Plugr. Find answers to common questions, learn how to use the platform, and contact our support team. We're here to help!",
  openGraph: {
    title: "Help Center - Plugr",
    description: "Get help with Plugr. Find answers and connect with our support team.",
    type: "website",
    url: "https://useplugr.app/help",
  },
};

type HelpTopic = {
  id: string;
  title: string;
  summary: string;
  intro: string;
  steps: string[];
  bestPractices: string[];
  avoid: string[];
};

type HelpFaq = {
  question: string;
  answer: string;
  tags: string[];
};

const helpTopics: HelpTopic[] = [
  {
    id: "getting-started",
    title: "Getting started",
    summary: "Set up your account, verify your email, and understand the core Plugr flow.",
    intro:
      "If you are new to Plugr, start with signup, confirm your email, and complete the basic profile fields before trying to discover or list services.",
    steps: [
      "Create your account and verify the email you registered with.",
      "Add your name, faculty, department, level, location, and phone number.",
      "Choose whether you are a provider, requester, or both.",
      "Open Discover to browse classmates by skill, credibility, and verification.",
    ],
    bestPractices: ["Use your real school identity so people can trust the profile at a glance.", "Finish the setup on day one so your profile is immediately discoverable."],
    avoid: ["Do not leave the profile half-empty and expect strong visibility.", "Do not use unclear names or random nicknames if you want people to remember you."],
  },
  {
    id: "profile-exposure",
    title: "Profile setup for best exposure",
    summary: "Make your profile easier to find and more convincing when people open it.",
    intro:
      "A strong profile gets more clicks and more replies. The goal is clarity: who you are, what you do, and how people can reach you.",
    steps: [
      "Use a clear profile photo with your face visible.",
      "Write a short bio that says what you offer, what level you are at, and what makes you reliable.",
      "Put your main skill first and keep products or services current.",
      "Update your location so nearby students can find you faster.",
    ],
    bestPractices: ["Write in plain language instead of hype.", "Add a few real examples of what you can do.", "Keep your contact details accurate and reachable."],
    avoid: ["Do not use blurry images or generic stock art as your profile photo.", "Do not hide your skill behind vague descriptions like 'I do everything'."],
  },
  {
    id: "credibility",
    title: "How credibility scoring works",
    summary: "Understand the complete credibility system and how profile setup, verification, and reviews combine to build trust.",
    intro:
      "Credibility is a long-term trust metric that ranges from 0–100 and is built from two main sources: profile setup plus verification badge (50 points total), and reviews from completed interactions (50 points). The system rewards consistency and genuine work, not quick wins. Your score is color-coded: 0–10 (Critical, red), 11–20 (Low, orange), 21–30 (Moderate, yellow), 31–60 (Good, amber), 61–100 (Excellent, green).",
    steps: [
      "Build your profile foundation (0–50 points): Complete all profile fields including name, photo, bio, faculty, department, level, location, and phone. Each field filled accurately adds to your score. A fully complete profile reaches the 50-point tier.",
      "Get verified and earn badge status (included in 50-point tier): Verify your email and pass the credibility checklist to unlock the verified badge. This shows you have met our identity and reliability standards.",
      "Earn reviews through real interactions (0–50 points): As you complete genuine service requests and provide value, customers can leave reviews. Each review adds 1–5 points depending on sentiment and quality. Positive reviews add more; neutral ones add less.",
      "Maintain consistency over time: Credibility is not built overnight. The system expects weeks and months of sustained good work, not a few days of heavy activity. Keep your profile updated and interactions professional.",
    ],
    bestPractices: ["Fill every profile section accurately and completely before seeking work.", "Respond quickly to inquiries and deliver exactly what you promise.", "Encourage reviews naturally by providing excellent service, not by asking aggressively.", "Update your profile photo, bio, and skill regularly to stay credible.", "Track your credibility color and score in your profile to see your standing."],
    avoid: ["Do not expect rapid credibility gains. Quick wins are not possible by design.", "Do not artificially request reviews or try to manipulate your score. Reviews are weighted by authenticity.", "Do not frequently change major profile details like name or faculty. Changes trigger badge re-review and disrupt momentum.", "Do not leave profile fields blank. Incomplete profiles stay in the Critical or Low range.", "Do not promise what you cannot deliver. Poor reviews or disputes hurt credibility far more than good reviews help it."],
  },
  {
    id: "verification",
    title: "Verification and badge review",
    summary: "Learn the difference between signup email verification and the credibility checklist.",
    intro:
      "Plugr uses two separate ideas: email verification for account access, and a credibility checklist for the public badge. The badge can be reviewed if important profile details change.",
    steps: [
      "Verify the email used during signup so your account is active.",
      "Complete the credibility checklist in your verification area.",
      "If your name changes, expect a review because the badge can be rechecked.",
      "Wait for review feedback if your badge is pending after edits.",
    ],
    bestPractices: ["Keep your name consistent across profile and verification information.", "Make sure profile photo, bio, and skill are all present before requesting review."],
    avoid: ["Do not treat the badge as permanent if you are changing key identity details.", "Do not confuse email verification with the public credibility badge."],
  },
  {
    id: "discover",
    title: "How to get the best out of discovery",
    summary: "Search smarter and make your profile more visible in results.",
    intro:
      "Discovery works best when your profile is clear, verified, and easy to scan. Users should be able to understand your value in a few seconds.",
    steps: [
      "Search by faculty, skill, or level to narrow down results.",
      "Use verification filters if you want trusted providers first.",
      "Keep your public profile current so search matches your real activity.",
      "Add products or services if you want more surface area in search.",
    ],
    bestPractices: ["Use the same skill terms students actually search for.", "Make your profile readable on mobile.", "Keep your credibility and review trail healthy."],
    avoid: ["Do not overstuff your profile with unrelated words.", "Do not leave important fields blank if you want higher visibility."],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting and account fixes",
    summary: "Solve common issues before waiting for support.",
    intro:
      "Most problems can be solved by refreshing the page, checking your email, or correcting profile data. Use this section when something does not behave as expected.",
    steps: [
      "Refresh the page if updated data is not visible immediately.",
      "Check spam and inbox folders for verification codes.",
      "Try a smaller image if uploads fail.",
      "Sign out and sign back in if your menu or profile appears stale.",
    ],
    bestPractices: ["Describe the page and what you clicked if you need support help.", "Keep screenshots ready when reporting a bug."],
    avoid: ["Do not submit multiple identical support requests for one issue.", "Do not change many profile fields at once if you are trying to isolate a bug."],
  },
];

const helpFaqs: HelpFaq[] = [
  { question: "Do I need to verify my email before using Plugr?", answer: "Yes. Signup email verification is the first step before the rest of the platform becomes fully available.", tags: ["getting started", "account", "email"] },
  { question: "How is my credibility score calculated?", answer: "Credibility is scored from 0–100 using two pillars: (1) Profile completion + verified badge status = up to 50 points. (2) Reviews from completed interactions = up to 50 points. Together they determine your total standing and color-coded level.", tags: ["credibility", "scoring", "system"] },
  { question: "How many points does each part contribute?", answer: "Profile setup and verified badge together make up 50 points of your credibility. Reviews make up the other 50 points. When you complete your entire profile, you can reach 50 points from that section alone. Getting verified adds significant standing. Reviews take time but are the other half of your score.", tags: ["credibility", "scoring", "breakdown"] },
  { question: "How much does each review add to my score?", answer: "Each review from a completed interaction adds 1–5 points depending on quality and sentiment. Positive reviews add more; neutral ones add less. You need consistent positive reviews over weeks and months to build up to 50 credibility points from reviews. There is no fast way to earn review points.", tags: ["credibility", "reviews", "scoring"] },
  { question: "What do the credibility colors mean?", answer: "Your credibility score is color-coded: 0–10 (Critical, red), 11–20 (Low, orange), 21–30 (Moderate, yellow), 31–60 (Good, amber), 61–100 (Excellent, green). The color appears on your credibility badge in the Discover feed and your profile so people can see your standing at a glance.", tags: ["credibility", "colors", "ranges"] },
  { question: "How long does it take to build credibility?", answer: "Credibility is intentionally a long-term metric. Expect to build it over weeks and months, not days. A complete profile plus verification can get you to 50 points quickly, but the remaining 50 points from reviews require sustained, genuine work. There are no shortcuts by design.", tags: ["credibility", "time", "reputation"] },
  { question: "Why did my verification badge change to pending?", answer: "Important profile changes, especially name updates, can send the badge back under review. This is by design to keep the verified badge trustworthy.", tags: ["verification", "badge", "review"] },
  { question: "How do I get found faster in Discover?", answer: "Use a strong skill title, complete your profile, keep your location current, stay verified, and build positive reviews over time. Higher credibility helps you appear higher in sorted results and makes students more likely to contact you.", tags: ["discover", "exposure", "credibility"] },
  { question: "Can I be both a buyer and a provider?", answer: "Yes. Plugr supports provider, requester, or both so one account can do both jobs.", tags: ["account", "mode", "provider"] },
  { question: "What should I send when reporting a bug?", answer: "Send the page name, what you clicked, what happened, and a screenshot if possible.", tags: ["support", "bug", "troubleshooting"] },
];

const supportLinks = [
  { title: "Email support", value: "contact@useplugr.app", href: "mailto:contact@useplugr.app", description: "Best for account, verification, and technical issues." },
  { title: "Live chat", value: "Start live chat", href: "#live-chat", description: "Use this for urgent questions and quick support requests." },
  { title: "X / Twitter", value: "@useplugr", href: "https://x.com/useplugr", description: "For updates, announcements, and lightweight support nudges." },
];

export default function HelpCenterPage() {
  return (
    <>
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Help Center", url: "https://useplugr.app/help" },
      ])}
      <main className="page-shell px-5 pt-28 sm:px-8 lg:px-16">
      <SiteHeader current="/help" variant="default" />
      <HelpCenterHub guides={helpTopics} faqs={helpFaqs} supportLinks={supportLinks} />
      <LiveChatWidget />
      <SiteFooter />
    </main>
    </>
  );
}