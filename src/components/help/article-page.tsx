"use client";

import Link from "next/link";
import { useState } from "react";
import { Breadcrumb } from "./breadcrumb";
import type { HelpArticle } from "@/lib/help-data";

function TableOfContents({ sections }: { sections: { heading: string }[] }) {
  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24 rounded-2xl border border-black/10 bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">On this page</p>
        <ul className="mt-3 space-y-2">
          {sections.map((section) => (
            <li key={section.heading}>
              <a
                href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function openLiveChat() {
  window.dispatchEvent(
    new CustomEvent("plugr:support-chat-open", {
      detail: {
        subject: "Help center article",
        message: "I need help with something from the help center.",
      },
    }),
  );
}

export function ArticlePage({ article, readingTime, relatedArticles }: { article: HelpArticle; readingTime: number; relatedArticles: HelpArticle[] }) {
  const [helpful, setHelpful] = useState<"yes" | "no" | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumb items={[{ label: "Help Center", href: "/help" }, { label: article.title }]} />

      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        <article className="min-w-0 space-y-8">
          <header className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-xl">{article.icon}</span>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--muted)]">{readingTime} min read</span>
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{article.title}</h1>
            <p className="text-base leading-7 text-[var(--muted)]">{article.description}</p>
          </header>

          <div className="rounded-2xl border border-black/10 bg-[var(--card)] p-5 text-sm leading-7 text-[var(--ink)]">
            {article.intro}
          </div>

          {article.sections.map((section) => (
            <section key={section.heading} id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="space-y-5">
              <h2 className="text-xl font-semibold">{section.heading}</h2>

              {section.content ? <p className="text-sm leading-7 text-[var(--ink)]">{section.content}</p> : null}

              {section.steps ? (
                <ol className="space-y-3">
                  {section.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-7 text-[var(--ink)]">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : null}

              {section.bestPractices || section.avoid ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.bestPractices ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <h3 className="text-sm font-semibold text-emerald-900">Best practices</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900/90">
                        {section.bestPractices.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {section.avoid ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <h3 className="text-sm font-semibold text-amber-900">Avoid these</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900/90">
                        {section.avoid.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          ))}

          <div className="rounded-2xl border border-black/10 bg-[var(--card)] p-5">
            <p className="text-sm font-semibold">Was this article helpful?</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setHelpful("yes")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${helpful === "yes" ? "bg-emerald-100 text-emerald-800" : "border border-black/10 bg-white text-[var(--ink)] hover:border-[var(--accent)]"}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHelpful("no")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${helpful === "no" ? "bg-amber-100 text-amber-800" : "border border-black/10 bg-white text-[var(--ink)] hover:border-[var(--accent)]"}`}
              >
                No
              </button>
            </div>
            {helpful === "no" ? (
              <div className="mt-3 rounded-xl bg-white p-3 text-sm text-[var(--muted)]">
                Sorry to hear that.{" "}
                <button type="button" onClick={openLiveChat} className="font-semibold text-[var(--accent)] hover:underline">
                  Start a live chat
                </button>{" "}
                and we&apos;ll help you directly.
              </div>
            ) : null}
          </div>

          {relatedArticles.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Related articles</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/help/${related.slug}`}
                    className="rounded-2xl border border-black/10 bg-[var(--card)] p-4 transition hover:border-[var(--accent)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{related.icon}</span>
                      <p className="text-sm font-semibold">{related.title}</p>
                    </div>
                    <p className="mt-1 text-xs leading-6 text-[var(--muted)]">{related.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <div className="rounded-2xl border border-black/10 bg-[var(--card)] p-5 text-center">
            <p className="text-sm text-[var(--muted)]">Can&apos;t find what you&apos;re looking for?</p>
            <button type="button" onClick={openLiveChat} className="mt-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
              Start live chat
            </button>
          </div>
        </article>

        <TableOfContents sections={article.sections} />
      </div>
    </div>
  );
}
