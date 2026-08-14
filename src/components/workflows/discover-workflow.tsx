"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StudentProfile } from "@/lib/types";
import { formatCredibilityScore } from "@/lib/credibility-colors";

type DiscoverWorkflowProps = {
  initialProviders: StudentProfile[];
};

type SortOption = "recommended" | "new" | "verified" | "old" | "credibility" | "name";
type VerificationFilter = "all" | "verified" | "pending";

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function DiscoverWorkflow({ initialProviders }: DiscoverWorkflowProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [feedProviders, setFeedProviders] = useState<StudentProfile[]>(initialProviders);
  const [feedLoading, setFeedLoading] = useState(initialProviders.length === 0);
  const [feedCursor, setFeedCursor] = useState<string | undefined>(undefined);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);

  useEffect(() => {
    if (initialProviders.length > 0) return;
    const controller = new AbortController();

    async function loadFeed() {
      try {
        const response = await fetch("/api/discover/providers?limit=20", { signal: controller.signal });
        if (!response.ok) return;
        const data = (await response.json()) as { providers: StudentProfile[]; nextCursor?: string };
        setFeedProviders(data.providers);
        setFeedCursor(data.nextCursor);
      } catch {
        // ignore abort or network errors
      } finally {
        setFeedLoading(false);
      }
    }

    loadFeed();
    return () => controller.abort();
  }, [initialProviders.length]);

  async function loadMoreFeed() {
    if (!feedCursor || feedLoadingMore) return;
    setFeedLoadingMore(true);
    try {
      const response = await fetch(`/api/discover/providers?limit=20&cursor=${feedCursor}`);
      if (!response.ok) return;
      const data = (await response.json()) as { providers: StudentProfile[]; nextCursor?: string };
      setFeedProviders((prev) => {
        const map = new Map<string, StudentProfile>();
        for (const p of prev) map.set(p.id, p);
        for (const p of data.providers) map.set(p.id, p);
        return Array.from(map.values());
      });
      setFeedCursor(data.nextCursor);
    } catch {
      // ignore
    } finally {
      setFeedLoadingMore(false);
    }
  }

  const hasActiveFilters = verificationFilter !== "all" || facultyFilter !== "all" || skillFilter !== "all";

  const filteredProviders = useMemo(() => {
    const next = feedProviders
      .filter((p) => verificationFilter === "all" || p.verificationStatus === verificationFilter)
      .filter((p) => facultyFilter === "all" || p.faculty === facultyFilter)
      .filter((p) => skillFilter === "all" || (p.primarySkill || "Unspecified") === skillFilter);

    if (sortBy === "recommended") return next;

    next.sort((a, b) => {
      if (sortBy === "new") return b.updatedAt.localeCompare(a.updatedAt);
      if (sortBy === "old") return a.updatedAt.localeCompare(b.updatedAt);
      if (sortBy === "verified") {
        if (a.verificationStatus !== b.verificationStatus) return a.verificationStatus === "verified" ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      }
      if (sortBy === "credibility") return (b.credibility || 0) - (a.credibility || 0);
      return a.fullName.localeCompare(b.fullName);
    });

    return next;
  }, [feedProviders, verificationFilter, facultyFilter, skillFilter, sortBy]);

  const facultyOptions = useMemo(() => {
    const values = new Set(feedProviders.map((p) => p.faculty).filter(Boolean));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [feedProviders]);

  const skillOptions = useMemo(() => {
    const values = new Set(feedProviders.map((p) => p.primarySkill || "Unspecified").filter(Boolean));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [feedProviders]);

  function clearFilters() {
    setVerificationFilter("all");
    setFacultyFilter("all");
    setSkillFilter("all");
  }

  return (
    <section className="space-y-4">
      {/* Search bar + filter icon + sort */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm text-[var(--muted)] transition hover:border-black/20"
        >
          <span className="flex items-center gap-3">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search by skill or name...
          </span>
        </button>

        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
            filtersOpen || hasActiveFilters
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-black/15 bg-white text-[var(--muted)] hover:border-black/25"
          }`}
          aria-label="Toggle filters"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {hasActiveFilters ? (
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--accent-2)] text-[8px] font-bold text-white ring-2 ring-white">
              {(verificationFilter !== "all" ? 1 : 0) + (facultyFilter !== "all" ? 1 : 0) + (skillFilter !== "all" ? 1 : 0)}
            </span>
          ) : null}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="h-11 shrink-0 rounded-2xl border border-black/15 bg-white px-3 text-sm outline-none"
        >
          <option value="recommended">Recommended</option>
          <option value="new">Newest</option>
          <option value="verified">Verified</option>
          <option value="old">Oldest</option>
          <option value="credibility">Top credibility</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Filter panel */}
      {filtersOpen ? (
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Filters</p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="text-xs font-semibold text-[var(--accent)] hover:underline">
                Clear all
              </button>
            ) : null}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-medium text-[var(--muted)]">
              Verification
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as VerificationFilter)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="verified">Verified only</option>
                <option value="pending">Pending only</option>
              </select>
            </label>
            <label className="text-xs font-medium text-[var(--muted)]">
              Faculty
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              >
                <option value="all">All faculties</option>
                {facultyOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-[var(--muted)]">
              Skill
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              >
                <option value="all">All skills</option>
                {skillOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      {/* Feed */}
      <FeedProviders providers={filteredProviders} loading={feedLoading} hasMore={Boolean(feedCursor)} loadingMore={feedLoadingMore} onLoadMore={loadMoreFeed} />

      {/* Search modal */}
      {searchOpen ? <SearchModal onClose={() => setSearchOpen(false)} /> : null}
    </section>
  );
}

/* ─── Original feed (simplified, no search logic) ─── */

function FeedProviders({ providers, loading, hasMore, loadingMore, onLoadMore }: { providers: StudentProfile[]; loading: boolean; hasMore: boolean; loadingMore: boolean; onLoadMore: () => void }) {
  const trackedRef = useRef(new Set<string>());

  useEffect(() => {
    if (providers.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-provider-id");
          if (!id || trackedRef.current.has(id)) continue;
          trackedRef.current.add(id);
          fetch("/api/provider/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerId: id, eventType: "search_appearance" }),
          }).catch(() => undefined);
        }
      },
      { threshold: 0.5 }
    );

    const cards = document.querySelectorAll("[data-provider-id]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [providers]);
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <article key={`feed-skeleton-${i}`} className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="skeleton h-13 w-13 rounded-full" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton h-3 w-28 rounded" />
                </div>
              </div>
              <div className="skeleton h-6 w-20 rounded" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="skeleton h-9 w-28 rounded-lg" />
              <div className="skeleton h-9 w-40 rounded-lg" />
            </div>
          </article>
        ))}
        <div className="flex justify-center">
          <div className="skeleton h-9 w-32 rounded-lg" />
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <>
        <article className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-[var(--muted)]">
          No providers found yet. Register a provider profile to appear in discovery.
        </article>
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold"
            disabled
          >
            No more providers
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <article key={provider.id} data-provider-id={provider.id} className="glass-card rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {provider.profileImage ? (
                <Image
                  src={provider.profileImage}
                  alt={`${provider.fullName} profile`}
                  width={52}
                  height={52}
                  loading="lazy"
                  className="h-13 w-13 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-white">
                  {initialsFromName(provider.fullName)}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{provider.fullName}</h2>
                  {provider.verificationStatus === "verified" ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 shadow-md" title="Verified">
                      <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--muted)]">{provider.primarySkill || "Service provider"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {(() => {
                const { displayScore, color } = formatCredibilityScore(provider.credibility);
                return (
                  <span className={`rounded-md border ${color.bgClass} ${color.textClass} ${color.borderClass} px-2 py-1 font-semibold`}>
                    {displayScore} credibility
                  </span>
                );
              })()}
            </div>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {provider.faculty} • {provider.department} • {provider.level}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">Location: {provider.locationText}</p>
          {provider.bio ? <p className="mt-2 text-sm">{provider.bio}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/discover/provider/${provider.id}`}
              className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold"
            >
              View profile
            </Link>
            {provider.storeSlug ? (
              <Link
                href={`/stores/${provider.storeSlug}`}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                View store
              </Link>
            ) : null}
          </div>
        </article>
      )      )}
      <div className="mt-4 flex justify-center">
        <button
          onClick={onLoadMore}
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold"
          disabled={loading || loadingMore || !hasMore}
        >
          {loading || loadingMore ? "Loading..." : hasMore ? "Load more" : "No more providers"}
        </button>
      </div>
    </div>
  );
}

/* ─── Search modal ─── */

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<StudentProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(20);
  const [cursor, setCursor] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<string | null>(null);
  const previousSearchKeyRef = useRef<string | null>(null);

  const activeSearch = query.trim();
  const searchKey = useMemo(() => [query.trim(), limit].join("|"), [query, limit]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function search() {
      const searchChanged = previousSearchKeyRef.current !== searchKey;
      previousSearchKeyRef.current = searchKey;
      const requestCursor = searchChanged ? null : cursorRef.current;

      if (!query.trim() && !requestCursor) {
        setProviders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        params.set("limit", String(limit));
        if (requestCursor) params.set("cursor", requestCursor);

        const response = await fetch(`/api/discover/providers?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to search providers.");

        const data = (await response.json()) as { providers: StudentProfile[]; nextCursor?: string };
        if (!requestCursor) {
          setProviders(data.providers);
        } else {
          setProviders((prev) => {
            const map = new Map<string, StudentProfile>();
            for (const p of prev) map.set(p.id, p);
            for (const p of data.providers) map.set(p.id, p);
            return Array.from(map.values());
          });
        }
        cursorRef.current = data.nextCursor ?? null;
        setCursor(data.nextCursor ?? null);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    search();
    return () => controller.abort();
  }, [query, limit, reloadCounter, searchKey]);

  useEffect(() => {
    cursorRef.current = null;
    setCursor(null);
  }, [query]);

  function loadMore() {
    setReloadCounter((n) => n + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 flex max-h-[75vh] w-full max-w-2xl flex-col rounded-2xl border border-black/10 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input + close */}
        <div className="flex items-center gap-2 border-b border-black/10 p-4">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by skill or name..."
              className="w-full rounded-xl border border-black/15 bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
            />
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/15 text-[var(--muted)] transition hover:border-black/25 hover:text-[var(--ink)]"
            aria-label="Close search"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error ? <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {!query.trim() && providers.length === 0 && !loading ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              Type something to search for providers.
            </div>
          ) : null}

          {query.trim() && providers.length === 0 && !loading ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              No providers found. Try a different search.
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <article key={`search-skeleton-${i}`} className="flex items-center gap-3 rounded-xl border border-black/10 p-4">
                  <div className="skeleton h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-36 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                </article>
              ))}
            </div>
          ) : providers.length > 0 ? (
            <>
              <p className="mb-3 text-xs text-[var(--muted)]">
                {providers.length} result{providers.length !== 1 ? "s" : ""}
                {activeSearch ? ` for "${activeSearch}"` : ""}
              </p>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <Link
                    key={provider.id}
                    href={`/discover/provider/${provider.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl border border-black/10 p-4 transition hover:border-black/20"
                  >
                    {provider.profileImage ? (
                    <Image
                      src={provider.profileImage}
                      alt={`${provider.fullName} profile`}
                      width={44}
                      height={44}
                      loading="lazy"
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                        {initialsFromName(provider.fullName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">{provider.fullName}</h3>
                        {provider.verificationStatus === "verified" ? (
                          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500" title="Verified">
                            <svg className="h-3 w-3 fill-white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-[var(--muted)]">{provider.primarySkill || "Service provider"}</p>
                      <p className="truncate text-xs text-[var(--muted)]">{provider.faculty} • {provider.department}</p>
                    </div>
                    <div className="shrink-0">
                      {(() => {
                        const { displayScore, color } = formatCredibilityScore(provider.credibility);
                        return (
                          <span className={`rounded-md border ${color.bgClass} ${color.textClass} ${color.borderClass} px-2 py-0.5 text-xs font-semibold`}>
                            {displayScore}
                          </span>
                        );
                      })()}
                    </div>
                  </Link>
                ))}
              </div>
              {cursor ? (
                <div className="mt-4 flex justify-center">
                  <button onClick={loadMore} className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" disabled={loading}>
                    {loading ? "Loading..." : "Load more"}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
