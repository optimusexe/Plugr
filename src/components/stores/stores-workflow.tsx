"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreProduct } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

type ProductWithProvider = StoreProduct & {
  providerName?: string;
  providerImage?: string;
  providerVerified?: boolean;
};

export function StoresWorkflow() {
  const [category, setCategory] = useState<string>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  async function load(pageCursor?: string, searchQuery?: string, categoryFilter?: string) {
    const params = new URLSearchParams({ limit: "24" });
    if (pageCursor) params.set("cursor", pageCursor);
    if (searchQuery) params.set("q", searchQuery);
    if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);

    const response = await fetch(`/api/stores/products?${params.toString()}`);
    if (!response.ok) return;
    const data = (await response.json()) as { products: StoreProduct[]; nextCursor?: string };
    return data;
  }

  async function refresh() {
    setLoading(true);
    try {
      const data = await load(undefined, query.trim() || undefined, category);
      if (!data) return;
      setProducts(data.products as ProductWithProvider[]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    async function initial() {
      setLoading(true);
      try {
        const response = await fetch("/api/stores/products?limit=24", { signal: controller.signal });
        if (!response.ok) return;
        const data = (await response.json()) as { products: StoreProduct[]; nextCursor?: string };
        setProducts(data.products as ProductWithProvider[]);
        setCursor(data.nextCursor);
      } catch {
        // ignore abort/network errors
      } finally {
        setLoading(false);
      }
    }
    initial();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (searchOpen) return;
    const timer = setTimeout(() => {
      void refresh();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, searchOpen]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await load(cursor, query.trim() || undefined, category);
      if (!data) return;
      const map = new Map<string, ProductWithProvider>();
      for (const p of products) map.set(p.id, p as ProductWithProvider);
      for (const p of data.products) map.set(p.id, p as ProductWithProvider);
      setProducts(Array.from(map.values()));
      setCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen((prev) => !prev)}
          className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm text-[var(--muted)] transition hover:border-black/20"
        >
          <span className="flex items-center gap-3">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search by product or category...
          </span>
        </button>
        <Link
          href="/stores/manage"
          className="shrink-0 rounded-2xl border border-black/15 bg-white px-4 py-3 text-sm font-semibold hover:border-black/25"
        >
          My store
        </Link>
      </div>

      {searchOpen ? (
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, categories..."
            className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
        </div>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory("all")}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            category === "all" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-black/10 bg-white text-[var(--muted)]"
          }`}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              category === cat ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-black/10 bg-white text-[var(--muted)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`store-skeleton-${i}`} className="rounded-2xl border border-black/10 bg-white p-3">
              <div className="skeleton h-40 w-full rounded-xl" />
              <div className="mt-3 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && products.length === 0 ? (
        <article className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-[var(--muted)]">
          No products found{query || category !== "all" ? " for those filters" : " yet"}. Check back soon.
        </article>
      ) : null}

      {!loading && products.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const image = product.imageUrls?.[0];
              return (
                <Link
                  key={product.id}
                  href={`/p/${product.id}`}
                  className="group rounded-2xl border border-black/10 bg-white p-3 transition hover:border-black/25 hover:shadow-sm"
                >
                  <div className="overflow-hidden rounded-xl border border-black/10 bg-[var(--card)]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        width={600}
                        height={340}
                        loading="lazy"
                        className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center text-xs text-[var(--muted)]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">{product.name}</h2>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{product.category || "Uncategorized"}</p>
                      {product.storeName ? (
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--accent)]">
                          Sold by {product.storeName}
                        </p>
                      ) : null}
                    </div>
                    {product.price ? (
                      <span className="shrink-0 rounded-md bg-[var(--accent)]/10 px-2 py-1 text-sm font-bold text-[var(--accent)]">
                        {product.price}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{product.viewCount} views</span>
                    <span>{product.clickCount} clicks</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={loading || loadingMore || !cursor}
              className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {loading || loadingMore ? "Loading..." : cursor ? "Load more" : "No more products"}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
