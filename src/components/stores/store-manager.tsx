"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreProduct } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { uploadCompressedImage } from "@/lib/image-compress";

const MAX_IMAGES = 8;

type StoreManagerProps = {
  profile: {
    id: string;
    userId: string;
  };
  storeSlug?: string;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
};

const EMPTY_FORM: FormState = { name: "", description: "", price: "", category: "", images: [] };

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function StoreManager({ profile, storeSlug }: StoreManagerProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StoreProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/products?provider=${profile.id}&limit=50`);
      if (!response.ok) return;
      const data = (await response.json()) as { products: StoreProduct[] };
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    async function initial() {
      setLoading(true);
      try {
        const response = await fetch(`/api/stores/products?provider=${profile.id}&limit=50`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { products: StoreProduct[] };
        setProducts(data.products);
      } catch {
        // ignore abort/network errors
      } finally {
        setLoading(false);
      }
    }
    void initial();
    return () => controller.abort();
  }, [profile.id]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setMessage(null);
  }

  function openEdit(product: StoreProduct) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      images: product.imageUrls,
    });
    setError(null);
    setMessage(null);
  }

  async function handleAddImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    if (form.images.length + files.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    try {
      const uploaded = await Promise.all(
        files.map((file) => uploadCompressedImage(file, "product")),
      );
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      setError(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload images.");
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  function handlePriceChange(value: string) {
    const withoutPrefix = value.startsWith("₦") ? value.slice(1) : value;
    setForm((prev) => ({
      ...prev,
      price: /^\d/.test(withoutPrefix) ? `₦${withoutPrefix}` : withoutPrefix,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        category: form.category,
        imageUrls: form.images,
      };

      const url = editing ? `/api/stores/products/${editing.id}` : "/api/stores/products";
      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { product?: StoreProduct; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to save product.");
      }

      setMessage(editing ? "Product updated." : "Product added to your store.");
      setForm(EMPTY_FORM);
      setEditing(null);
      await refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteRequest(product: StoreProduct) {
    setPendingDelete(product);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/stores/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to delete product.");
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editing?.id === id) {
        setEditing(null);
        setForm(EMPTY_FORM);
      }
      setPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete product.");
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-black/10 bg-[var(--card)] p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">My Store</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Manage your products</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add products to your storefront. Verified providers can list up to {MAX_IMAGES} images per product.
          </p>
        </div>
        <Link href={storeSlug ? `/stores/${storeSlug}` : "/stores"} className="inline-flex rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold">
          View storefront
        </Link>
      </header>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      {/* Product form */}
      <section className="rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {editing ? "Edit product" : "Add a product"}
          </p>
          {editing ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-[var(--muted)]">
              Product name *
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-[var(--muted)]">
              Price (₦ is added automatically; you can also type &quot;Negotiable&quot;)
              <input
                value={form.price}
                onChange={(event) => handlePriceChange(event.target.value)}
                placeholder="e.g. 2,500"
                className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-[var(--muted)] sm:col-span-2">
              Category
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-[var(--muted)] sm:col-span-2">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="mt-1 min-h-24 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              />
            </label>
          </div>

          {/* Images */}
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">Images ({form.images.length}/{MAX_IMAGES})</p>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative">
                  <div className="overflow-hidden rounded-xl border border-black/10 bg-[var(--card)]">
                    <Image src={image} alt={`Product image ${index + 1}`} width={200} height={150} className="h-24 w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.length < MAX_IMAGES ? (
                <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-black/20 bg-[var(--card)] text-xs text-[var(--muted)]">
                  <svg className="mb-1 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Add images
                  <input type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />
                </label>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save changes" : "Add product"}
          </button>
        </form>
      </section>

      {/* Product list */}
      <section className="rounded-2xl border border-black/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Your products ({products.length})</p>

        {loading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`mgr-skeleton-${i}`} className="skeleton h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {!loading && products.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No products yet. Add your first product above.
          </p>
        ) : null}

        {!loading && products.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {products.map((product) => {
              const image = product.imageUrls[0];
              return (
                <li key={product.id} className="flex items-center gap-3 rounded-xl border border-black/10 bg-[var(--card)] p-3">
                  {image ? (
                    <Image src={image} alt={product.name} width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-semibold text-white">
                      {initialsFromName(product.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {product.category || "Uncategorized"}
                      {product.price ? ` • ${product.price}` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {product.viewCount} views • {product.clickCount} clicks
                      {product.clickCount > 0 && product.viewCount > 0
                        ? ` • ${Math.round((product.clickCount / product.viewCount) * 100)}% conversion`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/p/${product.id}`}
                      className="rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-semibold"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(product)}
                      disabled={deletingId === product.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                    >
                      {deletingId === product.id ? "..." : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Delete product</p>
            <h2 className="mt-2 font-display text-xl font-bold">Delete &quot;{pendingDelete.name}&quot;?</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This will permanently remove the product from your storefront. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deletingId === pendingDelete.id}
                className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deletingId === pendingDelete.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {deletingId === pendingDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
