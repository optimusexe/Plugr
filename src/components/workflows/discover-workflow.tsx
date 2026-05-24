"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { StudentProfile } from "@/lib/types";
import { formatCredibilityScore } from "@/lib/credibility-colors";

type DiscoverWorkflowProps = {
  initialProviders: StudentProfile[];
};

type SortOption = "recommended" | "new" | "verified" | "old" | "credibility" | "name";
type VerificationFilter = "all" | "verified" | "pending";

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "S";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function DiscoverWorkflow({ initialProviders }: DiscoverWorkflowProps) {
  const [query, setQuery] = useState("");
  // default to server-recommended ordering
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [rawProviders, setRawProviders] = useState<StudentProfile[]>(initialProviders);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(20);
  const [cursor, setCursor] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  const facultyOptions = useMemo(() => {
    const values = new Set(rawProviders.map((provider) => provider.faculty).filter(Boolean));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [rawProviders]);

  const skillOptions = useMemo(() => {
    const values = new Set(rawProviders.map((provider) => provider.primarySkill || "Unspecified").filter(Boolean));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [rawProviders]);

  const providers = useMemo(() => {
    const next = rawProviders
      .filter((provider) => {
        if (verificationFilter === "all") {
          return true;
        }

        return provider.verificationStatus === verificationFilter;
      })
      .filter((provider) => {
        if (facultyFilter === "all") {
          return true;
        }

        return provider.faculty === facultyFilter;
      })
      .filter((provider) => {
        if (skillFilter === "all") {
          return true;
        }

        const skill = provider.primarySkill || "Unspecified";
        return skill === skillFilter;
      });

    // If server-recommended ordering is selected, preserve server order (no client-side sort)
    if (sortBy === "recommended") return next;

    next.sort((a, b) => {
      if (sortBy === "new") {
        return b.updatedAt.localeCompare(a.updatedAt);
      }

      if (sortBy === "old") {
        return a.updatedAt.localeCompare(b.updatedAt);
      }

      if (sortBy === "verified") {
        if (a.verificationStatus !== b.verificationStatus) {
          return a.verificationStatus === "verified" ? -1 : 1;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      }

      if (sortBy === "credibility") {
        return (b.credibility || 0) - (a.credibility || 0);
      }

      return a.fullName.localeCompare(b.fullName);
    });

    return next;
  }, [rawProviders, verificationFilter, facultyFilter, skillFilter, sortBy]);

  const resultLabel = useMemo(() => {
    if (providers.length === 1) {
      return "Showing 1 provider";
    }

    return `Showing ${providers.length} providers`;
  }, [providers.length]);

  const activeSearch = query.trim();

  useEffect(() => {
    const controller = new AbortController();

    async function loadProviders() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        params.set("limit", String(limit));
        if (cursor) params.set("cursor", cursor);
        if (verificationFilter === "verified") params.set("verifiedOnly", "true");

        const response = await fetch(`/api/discover/providers?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to fetch providers right now.");

        const data = (await response.json()) as { providers: StudentProfile[]; nextCursor?: string };
        if (!cursor) {
          // replace with fresh page
          setRawProviders(data.providers);
        } else {
          // append but deduplicate by id to avoid duplicates across pages
          setRawProviders((prev) => {
            const map = new Map<string, StudentProfile>();
            for (const p of prev) map.set(p.id, p);
            for (const p of data.providers) map.set(p.id, p);
            return Array.from(map.values());
          });
        }
        setCursor(data.nextCursor ?? null);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError("Unable to load providers. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProviders();

    return () => {
      controller.abort();
    };
  }, [query, cursor, verificationFilter, limit, reloadCounter]);

  // reset cursor when query or verification filter changes
  useEffect(() => {
    setCursor(null);
  }, [query, verificationFilter]);

  function loadMore() {
    setReloadCounter((n) => n + 1);
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <div className="grid gap-3">
          <label className="text-sm font-medium text-[var(--muted)]">
            Search by skill, faculty, name, or level
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Computer engineer"
              className="mt-2 w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
            />
          </label>

          <div className="grid gap-3 lg:grid-cols-2">
            <label className="text-sm font-medium text-[var(--muted)]">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="mt-2 w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm"
              >
                <option value="recommended">Recommended</option>
                <option value="new">New</option>
                <option value="verified">Verified</option>
                <option value="old">Old</option>
                <option value="credibility">Highest credibility</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </label>

            <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Filters</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Verification
                  <select
                    value={verificationFilter}
                    onChange={(event) => setVerificationFilter(event.target.value as VerificationFilter)}
                    className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
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
                    onChange={(event) => setFacultyFilter(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
                  >
                    <option value="all">All faculties</option>
                    {facultyOptions.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-medium text-[var(--muted)]">
                  Skill
                  <select
                    value={skillFilter}
                    onChange={(event) => setSkillFilter(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
                  >
                    <option value="all">All skills</option>
                    {skillOptions.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-black/5 px-3 py-2 text-xs text-[var(--muted)]">
            {loading ? "Searching..." : resultLabel}
            {activeSearch ? ` for "${activeSearch}"` : ""}
            {facultyFilter !== "all" ? ` • Faculty: ${facultyFilter}` : ""}
            {skillFilter !== "all" ? ` • Skill: ${skillFilter}` : ""}
          </div>
        </div>
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {providers.length === 0 && !loading ? (
        <article className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-[var(--muted)]">
          No providers found yet. Register a provider profile to appear in discovery.
        </article>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={`discover-skeleton-${index}`} className="rounded-2xl border border-black/10 bg-white p-5">
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
        </div>
      ) : null}

      <div className="space-y-4">
        {providers.map((provider) => (
          <article key={provider.id} className="glass-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {provider.profileImage ? (
                  <Image
                    src={provider.profileImage}
                    alt={`${provider.fullName} profile`}
                    width={52}
                    height={52}
                    unoptimized
                    className="h-13 w-13 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
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
              <span className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 text-sm text-[var(--muted)]">
                Live location supported in-app
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={loadMore}
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      </div>
    </section>
  );
}
