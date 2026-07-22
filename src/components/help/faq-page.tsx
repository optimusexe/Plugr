"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Breadcrumb } from "./breadcrumb";
import type { HelpFaq } from "@/lib/help-data";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

export function FaqPage({ faqs }: { faqs: HelpFaq[] }) {
  const [query, setQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return faqs;
    return faqs.filter((faq) => normalize([faq.question, faq.answer, faq.tags.join(" ")].join(" ")).includes(needle));
  }, [faqs, query]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    faqs.forEach((faq) => faq.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [faqs]);

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb items={[{ label: "Help Center", href: "/help" }, { label: "FAQ" }]} />

      <header className="mb-8 space-y-3">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Frequently asked questions</h1>
        <p className="text-base leading-7 text-[var(--muted)]">Quick answers to common questions about Plugr.</p>
      </header>

      <div className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions..."
          className="w-full rounded-2xl border border-black/10 bg-[var(--card)] px-5 py-3.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setQuery(tag)}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((faq) => {
          const isOpen = openItems.has(faq.question);
          return (
            <div key={faq.question} className="rounded-2xl border border-black/10 bg-[var(--card)] p-5">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 cursor-pointer text-left font-semibold text-[var(--ink)] transition hover:text-[var(--accent)]"
                onClick={() => {
                  setOpenItems((prev) => {
                    const next = new Set(prev);
                    if (next.has(faq.question)) {
                      next.delete(faq.question);
                    } else {
                      next.add(faq.question);
                    }
                    return next;
                  });
                }}
              >
                <span className={isOpen ? "text-[var(--accent)]" : ""}>{faq.question}</span>
                <span className="flex-shrink-0 text-xl font-light leading-none text-[var(--muted)]">{isOpen ? "\u00d7" : "+"}</span>
              </button>
              {isOpen && (
                <>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{faq.answer}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {faq.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-[var(--card)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">No results match that search. Try a different keyword.</p>
          </div>
        ) : null}
      </div>

      <div className="mt-10 rounded-2xl border border-black/10 bg-[var(--card)] p-6 text-center">
        <p className="text-sm text-[var(--muted)]">Can&apos;t find an answer?</p>
        <Link href="/help" className="mt-2 inline-block rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
          Browse all articles
        </Link>
      </div>
    </div>
  );
}
