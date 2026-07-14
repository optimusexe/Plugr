import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Terms of Service | Plugr",
  description: "Plugr terms governing access to and use of the Platform.",
};

const effectiveDate = "13 July 2026";
const lastUpdated = "13 July 2026";

const termsSections = [
  {
    title: "1. Eligibility",
    items: [
      "Be a currently enrolled student at a Nigerian university",
      "Be at least 16 years of age",
      "Provide accurate and truthful information during registration",
      "Not have been previously suspended or removed from the Platform for violation of these Terms",
      "Currently, the Platform is available to students of Lagos State University (LASU). We intend to expand access to additional Nigerian universities in the future.",
    ],
  },
  {
    title: "2. Account Registration",
    items: [
      "Provide accurate, current, and complete information",
      "Maintain and promptly update your account information",
      "Keep your login credentials confidential",
      "Accept responsibility for all activity that occurs under your account",
      "You must notify us immediately at babseli933@gmail.com if you suspect any unauthorised use of your account.",
    ],
  },
  {
    title: "3. Provider Profiles",
    subSections: [
      {
        title: "3.1 Creating a Profile",
        items: [
          "Confirm that you are the person described in the profile",
          "Confirm that the skills and services listed accurately represent what you offer",
          "Consent to your profile being visible to all registered users of the Platform",
          "Agree to respond to genuine enquiries in a timely and professional manner",
        ],
      },
      {
        title: "3.2 Credibility Score",
        items: [
          "Your credibility score is a trust metric calculated from your profile completeness, verification status, and reviews received from completed interactions.",
          "The score ranges from 0 to 100 and is displayed publicly on your profile.",
          "You agree not to attempt to manipulate, artificially inflate, or deceive the credibility scoring system through false reviews, fake interactions, or any other means.",
        ],
      },
      {
        title: "3.3 Accuracy of Information",
        items: [
          "You are solely responsible for the accuracy of information in your provider profile.",
          "Plugr does not independently verify the qualifications, skills, or identity of providers beyond the verification process available on the Platform.",
          "Users are encouraged to exercise their own judgment when engaging a provider.",
        ],
      },
    ],
  },
  {
    title: "4. Transactions Between Users",
    items: [
      "Plugr is a discovery and connection platform. We do not facilitate, process, or mediate payments between users.",
      "All financial transactions, service agreements, and arrangements made between a service seeker and a provider occur entirely off-platform and are solely the responsibility of the parties involved.",
      "Plugr bears no responsibility or liability for the quality, delivery, or outcome of any service arranged through the Platform, any disputes between users arising from a service interaction, any financial loss incurred as a result of a transaction between users, or any failure by a provider to deliver a promised service.",
      "We strongly encourage users to exercise caution and good judgment before engaging in any financial transaction with another user.",
    ],
  },
  {
    title: "5. Prohibited Conduct",
    items: [
      "Create a false or misleading profile or impersonate any other person",
      "Post content that is offensive, defamatory, hateful, or discriminatory",
      "Use the Platform to harass, threaten, or intimidate any other user",
      "Submit false reviews or manipulate the credibility scoring system",
      "Use another user's contact information for purposes unrelated to the service they offer",
      "Attempt to gain unauthorised access to any part of the Platform or its systems",
      "Use the Platform for any unlawful purpose or in violation of any applicable law",
      "Reproduce, copy, or distribute any part of the Platform without our prior written consent",
      "Violation of any of the above may result in immediate suspension or permanent removal of your account.",
    ],
  },
  {
    title: "6. Reviews and User Content",
    items: [
      "Users may submit reviews of providers following a completed service interaction.",
      "By submitting a review, you confirm that the review reflects a genuine interaction or service experience, the content is accurate and not intended to harm, defame, or mislead, and you grant Plugr a non-exclusive licence to display the review on the Platform.",
      "We reserve the right to remove any review that we determine, in our sole discretion, to be false, abusive, or in violation of these Terms.",
    ],
  },
  {
    title: "7. Intellectual Property",
    items: [
      "All content on the Platform, including but not limited to the Plugr name, logo, design, text, and software, is the property of Plugr and is protected under applicable intellectual property laws.",
      "You may not use, copy, reproduce, or distribute any part of the Platform's content without our prior written permission.",
      "User-generated content, including profile information and reviews, remains the property of the respective users.",
      "By posting content on the Platform, you grant Plugr a non-exclusive, royalty-free licence to display that content on the Platform.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    items: [
      "To the fullest extent permitted by applicable law, Plugr and its founder shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Platform, including but not limited to loss resulting from a service interaction between users, loss of data or unauthorised access to your account, any reliance placed on information displayed on the Platform, or interruption or unavailability of the Platform.",
      "Our total liability to you for any claim arising from these Terms or your use of the Platform shall not exceed the amount you have paid to us in the twelve months preceding the claim.",
      "As the Platform is currently free to use, this amount is zero.",
    ],
  },
  {
    title: "9. Disclaimers",
    items: [
      `The Platform is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied.`,
      "We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components.",
      "We make no representations regarding the accuracy or completeness of any content on the Platform.",
    ],
  },
  {
    title: "10. Termination",
    items: [
      "We reserve the right to suspend or permanently terminate your access to the Platform at any time, with or without notice, if we determine that you have violated these Terms or that your continued use poses a risk to the Platform or other users.",
      "You may terminate your account at any time by contacting us at babseli933@gmail.com.",
      "Upon termination, your profile will be removed from public view in accordance with our Privacy Policy.",
    ],
  },
  {
    title: "11. Modifications to These Terms",
    items: [
      "We may update these Terms from time to time.",
      "When we make material changes, we will notify users through the Platform or via the contact information provided at registration.",
      "Your continued use of the Platform after any update constitutes your acceptance of the revised Terms.",
    ],
  },
  {
    title: "12. Governing Law",
    items: [
      "These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.",
      "Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.",
    ],
  },
  {
    title: "13. Contact Us",
    items: [
      "Elijah Opeyemi Babatunde",
      "Founder, Plugr",
      "Email: contact@useplugr.app",
      "Website: useplugr.app",
      "Location: Lagos State, Nigeria",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="page-shell px-5 pt-28 sm:px-8 lg:px-16">
      <SiteHeader current="/terms" variant="landing" />

      <section className="mx-auto max-w-4xl py-10 sm:py-14 lg:py-20">
        <div className="space-y-4">
          <p className="inline-flex rounded-full border border-[var(--accent)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Terms of Service
          </p>
          <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.04em] sm:text-6xl">
            PLUGR TERMS OF SERVICE
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
          </p>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            These Terms of Service ("Terms") govern your access to and use of the Plugr platform, available at useplugr.app ("Platform"), operated by Elijah Opeyemi Babatunde ("Plugr," "we," "us," or "our"). Please read these Terms carefully before using the Platform.
          </p>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            By registering an account or using any part of the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Platform.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {termsSections.map((section) => (
            <article key={section.title} className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold sm:text-2xl">{section.title}</h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
                {section.subSections ? (
                  section.subSections.map((subSection) => (
                    <div key={subSection.title} className="space-y-2">
                      <h3 className="font-semibold text-[var(--text)]">{subSection.title}</h3>
                      <ul className="space-y-2">
                        {subSection.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/privacy-policy" className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
            Read Privacy Policy
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