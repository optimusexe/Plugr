import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy Policy | Plugr",
  description: "Plugr privacy policy and user data handling practices.",
};

const effectiveDate = "13 July 2026";
const lastUpdated = "13 July 2026";

const collectSections = [
  {
    title: "1.1 Information You Provide Directly",
    items: [
      "Full name",
      "Email address",
      "Phone number",
      "University name, faculty, department, and level",
      "Profile photo",
      "Bio and service description",
      "Campus location (building or area)",
      "Skill or service category",
    ],
  },
  {
    title: "1.2 Information Generated Through Your Use",
    items: [
      "Credibility score derived from profile completeness, verification status, and reviews received",
      "Reviews and ratings submitted by other users",
      "Date and time of account creation and profile updates",
      "Records of services confirmed as completed on the Platform",
    ],
  },
  {
    title: "1.3 Location Information",
    items: [
      "If you choose to use the live location feature, we access your device's real-time location data solely to provide campus navigation and directions to other users seeking your services.",
      "This data is not stored permanently and is only shared when you have enabled the feature.",
    ],
  },
  {
    title: "1.4 Information We Do Not Collect",
    items: [
      "Plugr does not currently process payments.",
      "We do not collect financial information, bank account details, card numbers, or any payment credentials.",
      "All transactions between users occur off-platform and are the sole responsibility of the parties involved.",
    ],
  },
];

const useSections = [
  "To create and manage your account on the Platform",
  "To display your provider profile to other users searching for services",
  "To calculate and display your credibility score",
  "To enable other users to contact you via call, WhatsApp, or email",
  "To provide campus navigation directions to your stated location",
  "To send you important updates about the Platform, including changes to this policy",
  "To improve the functionality and performance of the Platform",
  "To respond to your inquiries or support requests",
  "We do not use your information for automated decision-making that produces legal or similarly significant effects without human review.",
];

const sharingSections = [
  {
    title: "3.1 With Other Users",
    items: [
      "Your provider profile — including your name, photo, skill, faculty, department, level, campus location, contact details, bio, credibility score, and reviews — is visible to all registered users of the Platform.",
      "By creating a provider profile, you consent to this visibility.",
    ],
  },
  {
    title: "3.2 With Third-Party Services",
    items: [
      "We use Google Maps to power campus navigation features.",
      "When you or another user initiates directions, location data is shared with Google in accordance with Google's own Privacy Policy.",
      "We encourage you to review Google's Privacy Policy at policies.google.com.",
    ],
  },
  {
    title: "3.3 Legal Requirements",
    items: [
      "We may disclose your information if required to do so by law or in response to a valid legal request from a competent authority in Nigeria, including to comply with a court order or legal process.",
    ],
  },
  {
    title: "3.4 No Sale of Data",
    items: [
      "We do not sell, rent, or trade your personal information to any third party for commercial purposes.",
    ],
  },
];

const rightsSections = [
  "Right to access: You may request a copy of the personal information we hold about you",
  "Right to correction: You may update or correct your information directly through your profile settings",
  "Right to deletion: You may request that we delete your account and associated personal data",
  "Right to withdrawal of consent: You may withdraw consent to optional features such as live location sharing at any time through your device settings",
  "To exercise any of these rights, contact us at babseli933@gmail.com.",
];

const policySections = [
  {
    title: "1. Information We Collect",
    content: (
      <div className="space-y-4">
        {collectSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="font-semibold text-[var(--text)]">{section.title}</h3>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "2. How We Use Your Information",
    content: (
      <ul className="space-y-2">
        {useSections.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "3. How We Share Your Information",
    content: (
      <div className="space-y-4">
        {sharingSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="font-semibold text-[var(--text)]">{section.title}</h3>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "4. Data Retention",
    content: (
      <div className="space-y-2">
        <p>We retain your personal information for as long as your account remains active on the Platform.</p>
        <p>If you request deletion of your account, we will remove your personal data from our active systems within 30 days, except where retention is required by law or legitimate business purposes such as dispute resolution.</p>
      </div>
    ),
  },
  {
    title: "5. Data Security",
    content: (
      <div className="space-y-2">
        <p>We implement reasonable technical and organisational measures to protect your personal information from unauthorised access, disclosure, alteration, or destruction.</p>
        <p>However, no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security of your data and encourage you to take steps to protect your own account credentials.</p>
      </div>
    ),
  },
  {
    title: "6. Your Rights",
    content: (
      <ul className="space-y-2">
        {rightsSections.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "7. Children and Age Restriction",
    content: (
      <div className="space-y-2">
        <p>The Platform is intended for use by university students who are typically 16 years of age or older.</p>
        <p>We do not knowingly collect personal information from individuals under the age of 16. If we become aware that a user is under 16, we will take steps to remove their information from our systems.</p>
      </div>
    ),
  },
  {
    title: "8. Changes to This Privacy Policy",
    content: (
      <div className="space-y-2">
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons.</p>
        <p>When we make material changes, we will notify users through the Platform or via the contact information provided at registration. Your continued use of the Platform after the effective date of any updated policy constitutes your acceptance of the changes.</p>
      </div>
    ),
  },
  {
    title: "9. Contact Us",
    content: (
      <div className="space-y-2">
        <p>Elijah Opeyemi Babatunde</p>
        <p>Founder, Plugr</p>
        <p>Email: contact@useplugr.app</p>
        <p>Website: useplugr.app</p>
        <p>Location: Lagos State, Nigeria</p>
      </div>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell px-5 pt-28 sm:px-8 lg:px-16">
      <SiteHeader current="/privacy-policy" variant="landing" />

      <section className="mx-auto max-w-4xl py-10 sm:py-14 lg:py-20">
        <div className="space-y-4">
          <p className="inline-flex rounded-full border border-[var(--accent)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Privacy Policy
          </p>
          <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.04em] sm:text-6xl">
            PLUGR PRIVACY POLICY
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
          </p>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Plugr ("we," "us," or "our") is a campus discovery platform operated by Elijah Opeyemi Babatunde as a sole proprietorship. This Privacy Policy explains how we collect, use, store, and protect your personal information when you access or use the Plugr platform available at useplugr.app (the "Platform").
          </p>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            By creating an account or using the Platform, you agree to the collection and use of your information as described in this Privacy Policy. If you do not agree, please do not use the Platform.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {policySections.map((section) => (
            <article key={section.title} className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold sm:text-2xl">{section.title}</h2>
              <div className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">{section.content}</div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/terms" className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
            Read Terms of Service
          </Link>
          <Link href="/" className="rounded-xl border border-black/15 bg-white px-5 py-3 text-sm font-semibold">
            Back to home
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}