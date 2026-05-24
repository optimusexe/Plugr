"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type HelpGuide = {
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

type SupportLink = {
  title: string;
  value: string;
  href: string;
  description: string;
};

type HelpCenterHubProps = {
  guides: HelpGuide[];
  faqs: HelpFaq[];
  supportLinks: SupportLink[];
};

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

export function HelpCenterHub({ guides, faqs, supportLinks }: HelpCenterHubProps) {
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(guides[0]?.id ?? "");
  const [liveChatMessage, setLiveChatMessage] = useState("");

  const filteredFaqs = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return faqs;
    return faqs.filter((faq) => normalize([faq.question, faq.answer, faq.tags.join(" ")].join(" ")).includes(needle));
  }, [faqs, query]);

  const filteredGuides = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return guides;
    return guides.filter((guide) => normalize([guide.title, guide.summary, guide.intro, ...guide.steps, ...guide.bestPractices, ...guide.avoid].join(" ")).includes(needle));
  }, [guides, query]);

  const activeGuide = filteredGuides.find((guide) => guide.id === selectedTopic) ?? filteredGuides[0] ?? guides[0];

  function openLiveChat() {
    window.dispatchEvent(
      new CustomEvent("plugr:support-chat-open", {
        detail: {
          subject: "Help center live chat",
          message: liveChatMessage || "Hi, I need help with something from the help center.",
        },
      }),
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="rise rounded-3xl border border-black/10 bg-[var(--card)] p-6 shadow-[0_16px_40px_rgba(15,25,20,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex rounded-full border border-[var(--accent)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Help Center
            </p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">Everything you need to understand and use Plugr.</h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Find answers, setup guidance, credibility tips, support contact, and platform rules in one place.
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <label htmlFor="help-search" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Search help
            </label>
            <input
              id="help-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics, FAQs, support, verification..."
              className="mt-2 w-full rounded-xl border border-black/10 bg-[var(--card)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
            <p className="mt-3 text-xs leading-6 text-[var(--muted)]">Search both the topic guides and the FAQ answers to find the closest match quickly.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["getting-started", "Get started"],
            ["profile-exposure", "Profile tips"],
            ["credibility", "Credibility"],
            ["verification", "Verification"],
            ["troubleshooting", "Troubleshooting"],
            ["support", "Contact"],
          ].map(([href, label]) => (
            <Link key={href} href={`#${href}`} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
              {label}
            </Link>
          ))}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredGuides.map((guide) => {
          const isActive = guide.id === activeGuide?.id;
          return (
            <details
              key={guide.id}
              id={guide.id}
              open={isActive}
              onToggle={(event) => {
                if ((event.currentTarget as HTMLDetailsElement).open) {
                  setSelectedTopic(guide.id);
                }
              }}
              className="glass-card rounded-3xl border border-black/10 p-5 shadow-[0_12px_30px_rgba(15,25,20,0.06)]"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Topic</p>
                    <h2 className="mt-2 text-xl font-semibold">{guide.title}</h2>
                  </div>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--muted)]">{isActive ? "Open" : "Expand"}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{guide.summary}</p>
              </summary>

              <div className="mt-5 space-y-5">
                <p className="text-sm leading-7 text-[var(--ink)]">{guide.intro}</p>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">What to do</h3>
                  <ol className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink)]">
                    {guide.steps.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <h3 className="text-sm font-semibold text-emerald-900">Best practices</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900/90">
                      {guide.bestPractices.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-sm font-semibold text-amber-900">Avoid these</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900/90">
                      {guide.avoid.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">FAQs</p>
              <h2 className="mt-1 text-2xl font-semibold">Searchable answers</h2>
            </div>
            <p className="rounded-full bg-black/5 px-3 py-1 text-sm font-semibold text-[var(--muted)]">{filteredFaqs.length} result{filteredFaqs.length === 1 ? "" : "s"}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["account", "profile", "credibility", "verification", "support"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="rounded-full border border-black/10 bg-[var(--card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {filteredFaqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-black/10 bg-[var(--card)] p-4">
                <summary className="cursor-pointer list-none font-semibold text-[var(--ink)]">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{faq.answer}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {faq.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </details>
            ))}

            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/15 bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
                No FAQ result matches that search. Try a different word like profile, verification, or support.
              </div>
            ) : null}
          </div>
        </article>

        <article id="support" className="space-y-4 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Support</p>
            <h2 className="mt-1 text-2xl font-semibold">Live chat and ticket form</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Send a quick support request, or start a live chat thread that reaches our support inbox instantly.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {supportLinks.map((link) => (
              link.href === "#live-chat" ? (
                <button
                  key={link.title}
                  type="button"
                  onClick={openLiveChat}
                  className="rounded-2xl border border-black/10 bg-[var(--card)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                  <p className="text-sm font-semibold">{link.title}</p>
                  <p className="mt-1 text-sm text-[var(--accent)]">{link.value}</p>
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{link.description}</p>
                </button>
              ) : (
                <a
                  key={link.title}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="rounded-2xl border border-black/10 bg-[var(--card)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                  <p className="text-sm font-semibold">{link.title}</p>
                  <p className="mt-1 text-sm text-[var(--accent)]">{link.value}</p>
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{link.description}</p>
                </a>
              )
            ))}
          </div>

          <div id="live-chat" className="space-y-4 rounded-3xl border border-black/10 bg-[var(--card)] p-4">
            <div>
              <p className="text-sm font-semibold">Quick note for live chat</p>
              <p className="text-xs leading-6 text-[var(--muted)]">Add a short summary and open the chat widget. Customer care will see it in the admin inbox.</p>
            </div>
            <textarea
              value={liveChatMessage}
              onChange={(event) => setLiveChatMessage(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Short version of what you need help with"
            />
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={openLiveChat} className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
                Start live chat
              </button>
              <a href="mailto:contact@useplugr.app" className="inline-flex rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]">
                Email support
              </a>
            </div>
            <p className="text-xs leading-6 text-[var(--muted)]">The chat widget stays on-screen so you can keep the conversation going while support replies from the admin inbox.</p>
          </div>
        </article>
      </section>
    </section>
  );
}