"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Breadcrumb } from "./breadcrumb";
import type { HelpArticle, HelpFaq, SupportLink } from "@/lib/help-data";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function openLiveChat() {
  window.dispatchEvent(
    new CustomEvent("plugr:support-chat-open", {
      detail: {
        subject: "Help center live chat",
        message: "Hi, I need help with something from the help center.",
      },
    }),
  );
}

export function HelpCenterHub({ articles, faqs, supportLinks }: { articles: HelpArticle[]; faqs: HelpFaq[]; supportLinks: SupportLink[] }) {
  const [query, setQuery] = useState("");

  const filteredArticles = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return articles;
    return articles.filter((article) =>
      normalize([article.title, article.description, article.intro, article.category, ...article.sections.flatMap((s) => [s.heading, s.content || "", ...(s.steps || []), ...(s.bestPractices || []), ...(s.avoid || [])])].join(" ")).includes(needle),
    );
  }, [articles, query]);

  const matchingFaqs = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return [];
    return faqs.filter((faq) => normalize([faq.question, faq.answer, faq.tags.join(" ")].join(" ")).includes(needle)).slice(0, 3);
  }, [faqs, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Breadcrumb items={[{ label: "Help Center" }]} />

      <header className="rounded-3xl border border-black/10 bg-[var(--card)] p-6 shadow-[0_16px_40px_rgba(15,25,20,0.06)] sm:p-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">How can we help?</h1>
          <p className="text-sm leading-7 text-[var(--muted)] sm:text-base">Find answers, setup guidance, and support in one place.</p>
        </div>

        <div className="mt-6 max-w-xl">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for articles, FAQs, topics..."
              className="w-full rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>
        </div>
      </header>

      {matchingFaqs.length > 0 ? (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Quick answers</p>
          <div className="space-y-2">
            {matchingFaqs.map((faq) => (
              <Link
                key={faq.question}
                href="/help/faq"
                className="flex items-start gap-3 rounded-2xl border border-black/10 bg-[var(--card)] p-4 transition hover:border-[var(--accent)]"
              >
                <span className="mt-0.5 text-lg">💬</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{faq.question}</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--muted)] line-clamp-2">{faq.answer}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Browse articles</p>
          <Link href="/help/faq" className="text-xs font-semibold text-[var(--accent)] hover:underline">
            View all FAQs →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/help/${article.slug}`}
              className="group rounded-2xl border border-black/10 bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_12px_30px_rgba(15,25,20,0.06)]"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-xl transition group-hover:bg-[var(--accent)]/20">{article.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{article.title}</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--muted)] line-clamp-2">{article.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-[var(--card)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">No articles match that search. Try a different keyword.</p>
          </div>
        ) : null}
      </section>

      <section id="support" className="grid gap-4 sm:grid-cols-3">
        {supportLinks.map((link) =>
          link.href === "#live-chat" ? (
            <button
              key={link.title}
              type="button"
              onClick={openLiveChat}
              className="rounded-2xl border border-black/10 bg-[var(--card)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
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
              className="rounded-2xl border border-black/10 bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
            >
              <p className="text-sm font-semibold">{link.title}</p>
              <p className="mt-1 text-sm text-[var(--accent)]">{link.value}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{link.description}</p>
            </a>
          ),
        )}
      </section>
    </div>
  );
}
