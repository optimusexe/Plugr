import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HeroMockup } from "@/components/hero-mockup";
import { BreadcrumbSchema, WebSiteSchema, FAQSchema } from "@/lib/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Plugr - Campus Talent Map | Find & Connect with Students Fast",
  description:
    "Discover verified LASU students with trusted skills. Search by expertise, see credibility scores, and connect directly. The campus talent marketplace built for quick hiring and fast service.",
  alternates: {
    canonical: "https://useplugr.app",
  },
  openGraph: {
    title: "Plugr - Campus Talent Map",
    description:
      "Discover verified LASU students with trusted skills. Search by expertise, see credibility scores, and connect directly.",
    type: "website",
    url: "https://useplugr.app",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Plugr - Campus Talent Map",
      },
    ],
  },
};

const features = [
  {
    title: "Search by skill",
    detail: "Find the right student by service category, expertise, and campus profile.",
    tag: "20+ skills listed",
    accent: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" stroke="currentColor" strokeWidth="2" />
        <path d="m15.3 15.3 4.7 4.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Trust signals",
    detail: "See credibility, verification, and profile details before you reach out.",
    tag: "Credibility scoring",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="2" />
        <path d="m9.5 12 1.8 1.8 3.2-3.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Fast connection",
    detail: "Move from discovery to direct contact in one tap with no extra friction.",
    tag: "One tap contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Campus directions",
    detail: "Help students find you quickly with live location support and map-ready context.",
    tag: "Live location support",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M12 21s6-5.2 6-12a6 6 0 0 0-12 0c0 6.8 6 12 6 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: "Register",
    detail: "Create your account and verify your student email.",
  },
  {
    title: "Set up your profile",
    detail: "Add your faculty, level, campus location, and the skill or service you offer.",
  },
  {
    title: "Connect",
    detail: "Browse verified providers, check credibility scores, and reach out in one tap.",
  },
];

const audienceFlows = [
  {
    label: "I need a service",
    title: "Seeker",
    intro: "For students who want quick help from trusted campus providers.",
    steps: [
      "Search by skill, service, or campus location.",
      "Compare verified profiles and credibility scores.",
      "Reach out in one tap by call, WhatsApp, or email.",
    ],
  },
  {
    label: "I have a skill",
    title: "Provider",
    intro: "For students who want to be discovered and contacted fast.",
    steps: [
      "Set up your profile with faculty, level, and service details.",
      "Show credibility, reviews, and live location support.",
      "Let students contact you directly when they need your service.",
    ],
  },
];

const testimonials = [
  {
    avatar: "AS",
    quote:
      "I want a clean platform where I can find a student quickly without noise. This flow makes that obvious.",
    name: "Aminat S.",
    role: "LASU Student",
  },
  {
    avatar: "DT",
    quote:
      "The trust section matters most. If I can see faculty, level, and verification, I can decide faster.",
    name: "Daniel T.",
    role: "LASU Student",
  },
  {
    avatar: "KO",
    quote:
      "Role switching is the right approach. A student can request help today and offer service tomorrow.",
    name: "Kemi O.",
    role: "LASU Student",
  },
];

const faqs = [
  {
    question: "Do I register before I can use the platform?",
    answer: "Yes. The flow starts with account creation and email verification before profile setup.",
  },
  {
    question: "Can one account both hire and offer services?",
    answer: "Yes. Users can switch between provider, requester, or both.",
  },
  {
    question: "What do I see on a student profile?",
    answer: "You see name, faculty, level, skill, location, verification state, and contact options.",
  },
  {
    question: "Is this built for LASU only?",
    answer: "The first launch is LASU-first, with the workflow designed around campus trust and speed.",
  },
];

export default function Home() {
  return (
    <>
      <WebSiteSchema />
      {FAQSchema(faqs)}
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Discover", url: "https://useplugr.app/discover" },
      ])}
      <main className="page-shell px-5 pt-4 sm:px-8 lg:px-16">
      <SiteHeader current="/" variant="landing" />

      <section className="mx-auto grid min-h-[66vh] max-w-6xl items-center gap-12 py-0 sm:py-1 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-2">
        <div className="max-w-3xl space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-[var(--accent)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Built for students
            </p>
            <h1 className="font-display max-w-5xl text-7xl leading-[0.88] tracking-[-0.05em] sm:text-8xl lg:text-9xl">
              <span className="italic text-[var(--accent)]">Hire</span>{" "}
              <span className="inline-block mx-3">or</span>{" "}
              get{" "}
              <span className="italic text-[var(--accent)]">hired</span>{" "}
              <span className="inline-block ml-3">on</span>{" "}
              campus.
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl lg:mx-0">
              Connect and reach students who offer the service you need or get hired for what you offer — fast.
            </p>

            <div className="flex justify-center gap-3 pt-2 lg:justify-start">
              <Link href="/auth" className="button-hover rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
                Get started
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroMockup />
        </div>
      </section>

      <section id="features" className="mx-auto mt-32 max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">FEATURES</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Everything the marketplace needs</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {features.map((item) => (
            <article
              key={item.title}
              className={`hover-lift rounded-[14px] border p-6 sm:p-7 ${
                item.accent
                  ? "border-[#008075] bg-[#008075] text-white"
                  : "border-[#008075]/15 bg-white text-[#0D2E2B]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`icon-rotate flex h-12 w-12 items-center justify-center rounded-full ${item.accent ? "bg-white/15 text-white" : "bg-[#008075]/10 text-[#008075]"}`}>
                  {item.icon}
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    item.accent
                      ? "bg-white text-[#008075]"
                      : "bg-[#008075]/10 text-[#008075]"
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold sm:text-2xl">{item.title}</h3>
              <p className={`mt-3 text-sm leading-7 sm:text-base ${item.accent ? "text-white/88" : "text-[var(--muted)]"}`}>
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mt-32 w-[calc(100%+2.5rem)] -mx-5 bg-[#EDE8D8] px-5 py-14 sm:w-[calc(100%+4rem)] sm:-mx-8 sm:px-8 lg:w-[calc(100%+8rem)] lg:-mx-16 lg:px-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">HOW IT WORKS</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Three steps and you are live</h2>
        </div>
        <div className="relative mx-auto mt-10 max-w-4xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-7 top-12 bottom-12 hidden border-l border-dotted border-[#008075]/55 md:block"
          />
          <div className="space-y-4 sm:space-y-5">
            {steps.map((step, index) => (
              <article
                key={step.title}
                style={{ animationDelay: `${index * 120}ms` }}
                className="rise rounded-[14px] border border-[#008075]/12 bg-white px-5 py-5 sm:px-6 sm:py-6 md:pl-24 md:pr-7 md:py-8"
              >
                <div className="flex items-start gap-5 text-left">
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#008075] text-lg font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[#0D2E2B] sm:text-xl">{step.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">{step.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="who-is-plugr-for" className="mx-auto mt-8 max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">WHO IS PLUGR FOR?</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">Built for both sides of campus</h2>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {audienceFlows.map((flow, index) => (
            <article
              key={flow.title}
              style={{ animationDelay: `${index * 120}ms` }}
              className={`rise hover-lift rounded-[14px] border p-6 sm:p-7 ${
                index === 1 ? "border-[#008075]/28 bg-[#F5FBFA]" : "border-[#008075]/12 bg-white"
              }`}
            >
              <div className="inline-flex rounded-full bg-[#008075]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#008075]">
                {flow.label}
              </div>
              <h3 className="font-display mt-4 text-2xl sm:text-3xl">{flow.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">{flow.intro}</p>
              <div className="mt-6 space-y-4">
                {flow.steps.map((step, stepIndex) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#008075] text-sm font-semibold text-white">
                      {stepIndex + 1}
                    </div>
                    <p className="pt-0.5 text-sm leading-7 text-[#0D2E2B] sm:text-base">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7">
                <Link
                  href={index === 0 ? "/discover" : "/register"}
                  className={`button-hover inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    index === 1
                      ? "bg-[#008075] text-white"
                      : "border border-[#008075]/15 bg-white text-[#008075]"
                  }`}
                >
                  {index === 0 ? "Find a provider" : "Create your profile"}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonials" className="mt-32 w-[calc(100%+2.5rem)] -mx-5 bg-[#EDE8D8] px-5 py-14 sm:w-[calc(100%+4rem)] sm:-mx-8 sm:px-8 lg:w-[calc(100%+8rem)] lg:-mx-16 lg:px-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Testimonials</p>
          <h2 className="font-display mt-2 text-4xl sm:text-5xl">What students are saying</h2>
        </div>
        <div className="mx-auto mt-10 max-w-6xl grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="hover-glow rounded-[14px] border border-[#008075]/12 bg-white p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#008075] text-sm font-semibold text-white">
                  {item.avatar}
                </div>
                <div>
                  <p className="font-semibold text-base sm:text-lg">{item.name}</p>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#008075]">{item.role}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)] sm:text-base">"{item.quote}"</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faqs" className="mx-auto mt-32 max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">FAQs</p>
          <h2 className="font-display mt-2 text-4xl sm:text-5xl">Common questions</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base sm:text-lg text-[var(--muted)]">Everything you need to know before getting started.</p>
        </div>
        <div className="mx-auto mt-6 max-w-2xl space-y-3">
          {faqs.map((item) => (
            <details key={item.question} className="transition-smooth group glass-card rounded-xl p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-base sm:text-lg transition-smooth">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="relative flex h-6 w-6 shrink-0 items-center justify-center text-[var(--accent)]"
                >
                  <span className="absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-200 group-open:rotate-45" />
                  <span className="absolute h-4 w-0.5 rounded-full bg-current transition-transform duration-200 group-open:rotate-45" />
                  <span className="absolute h-0.5 w-4 rounded-full bg-current transition-opacity duration-200 group-open:opacity-0" />
                </span>
              </summary>
              <p className="mt-3 text-sm sm:text-base text-[var(--muted)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="get-started" className="mx-auto mt-16 mb-12 max-w-6xl text-center">
        <div className="glass-panel rounded-3xl px-6 py-10 sm:px-8 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Get started</p>
          <h2 className="font-display mt-2 text-4xl sm:text-5xl">Ready to join Plugr?</h2>
          <p className="mt-3 text-base sm:text-lg text-[var(--muted)]">
            Register, verify, complete your profile, and start connecting on campus.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/auth" className="button-hover rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
              Register free
            </Link>
            <Link href="/auth" className="button-hover rounded-xl border border-black/15 bg-white px-5 py-3 text-sm font-semibold">
              Login
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
    </>
  );
}
