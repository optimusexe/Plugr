import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { OrganizationSchema, BreadcrumbSchema } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Plugr - Campus Talent Map | Find & Connect with Students Fast",
  description:
    "Discover verified LASU students with trusted skills. Search by expertise, see credibility scores, and connect directly. The campus talent marketplace built for quick hiring and fast service.",
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
    detail: "Find computer engineers, hair dressers, tailors, tutors, and more on campus.",
  },
  {
    title: "Trust signals",
    detail: "See faculty, level, verification state, and credibility before contacting anyone.",
  },
  {
    title: "Fast connection",
    detail: "Use direct contact and location details to reach the right person without delay.",
  },
  {
    title: "Campus focus",
    detail: "Built for LASU students first, with student-led listings and local context.",
  },
];

const steps = [
  {
    title: "Register",
    detail: "Create and verify your account.",
  },
  {
    title: "Setup profile",
    detail: "Add faculty, level, location, and the service you offer or need.",
  },
  {
    title: "Connect",
    detail: "Browse providers, review credibility, and contact fast.",
  },
];

const testimonials = [
  {
    quote:
      "I want a clean platform where I can find a student quickly without noise. This flow makes that obvious.",
    name: "Aminat S.",
    role: "LASU Student",
  },
  {
    quote:
      "The trust section matters most. If I can see faculty, level, and verification, I can decide faster.",
    name: "Daniel T.",
    role: "LASU Student",
  },
  {
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
      <OrganizationSchema />
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Discover", url: "https://useplugr.app/discover" },
      ])}
      <main className="page-shell px-5 pt-28 sm:px-8 lg:px-16">
      <SiteHeader current="/" variant="landing" />

      <section className="mx-auto flex min-h-[72vh] max-w-6xl items-center justify-center py-10 sm:py-14 lg:py-20">
        <div className="max-w-5xl space-y-8 text-center">
          <div className="space-y-5">
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
            <p className="mx-auto max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              Connect and reach students who offer the service you need or get hired for what you offer — fast.
            </p>
          </div>

          <div className="flex justify-center flex-wrap gap-3">
            <Link href="/auth" className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
              Get started
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto mt-32 max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Features</p>
          <h2 className="font-display mt-2 text-4xl sm:text-5xl">Everything the marketplace needs</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item) => (
            <article key={item.title} className="glass-card rounded-2xl p-5">
              <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto mt-32 max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">How it works</p>
          <h2 className="font-display mt-2 text-4xl sm:text-5xl">Three steps and you are live</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]">STEP {index + 1}</p>
              <h3 className="mt-2 text-lg sm:text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonials" className="mx-auto mt-32 max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Testimonials</p>
          <h2 className="font-display mt-2 text-4xl sm:text-5xl">What students are saying</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="glass-card rounded-2xl p-5">
              <p className="text-sm sm:text-base text-[var(--muted)]">"{item.quote}"</p>
              <p className="mt-4 font-semibold text-base sm:text-lg">{item.name}</p>
              <p className="text-sm text-[var(--muted)]">{item.role}</p>
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
            <details key={item.question} className="glass-card rounded-xl p-4">
              <summary className="cursor-pointer list-none font-semibold text-base sm:text-lg">{item.question}</summary>
              <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">{item.answer}</p>
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
            <Link href="/auth" className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
              Register free
            </Link>
            <Link href="/auth" className="rounded-xl border border-black/15 bg-white px-5 py-3 text-sm font-semibold">
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
