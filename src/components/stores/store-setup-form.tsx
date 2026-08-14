"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Store, StudentProfile } from "@/lib/types";
import { uploadCompressedImage } from "@/lib/image-compress";

type StoreSetupFormProps = {
  profile: StudentProfile;
  existingStore: Store | null;
};

export function StoreSetupForm({ profile, existingStore }: StoreSetupFormProps) {
  const [name, setName] = useState(existingStore?.name ?? profile.fullName.split(" ")[0] + "'s Store");
  const [tagline, setTagline] = useState(existingStore?.tagline ?? "");
  const [description, setDescription] = useState(existingStore?.description ?? "");
  const [bannerUrl, setBannerUrl] = useState(existingStore?.bannerUrl ?? "");
  const [logoUrl, setLogoUrl] = useState(existingStore?.logoUrl ?? "");
  const [whatsapp, setWhatsapp] = useState(existingStore?.whatsapp ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>, onUrl: (url: string) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadCompressedImage(file, "product");
      onUrl(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Store name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      bannerUrl: bannerUrl || undefined,
      logoUrl: logoUrl || undefined,
      whatsapp: whatsapp.trim(),
    };

    try {
      const url = existingStore ? `/api/stores/${existingStore.slug}` : "/api/stores";
      const response = await fetch(url, {
        method: existingStore ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { store?: Store; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to save store.");
      }

      setMessage(existingStore ? "Store updated." : "Store set up! Add products to start selling.");
      window.location.href = `/stores/${data.store?.slug ?? existingStore?.slug}`;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save store.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-2xl border border-black/10 bg-[var(--card)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Store setup</p>
        <h1 className="mt-2 font-display text-3xl font-bold">{existingStore ? "Edit your store" : "Set up your store"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Give your store a name and identity. Shoppers will see this on your storefront at /stores/your-store-name.
        </p>
      </header>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
        <label className="block text-sm font-medium text-[var(--muted)]">
          Store name *
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Jem's Kreatives"
            className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
            required
            maxLength={60}
          />
        </label>

        <label className="block text-sm font-medium text-[var(--muted)]">
          Tagline
          <input
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            placeholder="e.g. Custom designs for LASU students"
            className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
            maxLength={120}
          />
        </label>

        <label className="block text-sm font-medium text-[var(--muted)]">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What do you sell? Why should students shop with you?"
            className="mt-1 min-h-24 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
        </label>

        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Store logo</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Square image, e.g. 512 × 512. Used as your store&apos;s icon and in share previews.</p>
          <div className="mt-2 flex items-center gap-4">
            {logoUrl ? (
              <Image src={logoUrl} alt="Store logo" width={96} height={96} className="h-24 w-24 rounded-2xl border border-black/10 object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-black/10 bg-[var(--card)] text-xs text-[var(--muted)]">
                No logo
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black/15 bg-[var(--card)] px-3 py-2 text-xs font-semibold">
              {uploading ? "Uploading..." : logoUrl ? "Change logo" : "Upload logo"}
              <input type="file" accept="image/*" onChange={(event) => handleImageChange(event, setLogoUrl)} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Banner image</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Recommended size: 1200 × 300 (wide, landscape).</p>
          {bannerUrl ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-black/10">
              <Image src={bannerUrl} alt="Store banner" width={1200} height={300} className="h-36 w-full object-cover" />
            </div>
          ) : null}
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black/15 bg-[var(--card)] px-3 py-2 text-xs font-semibold">
            {uploading ? "Uploading..." : bannerUrl ? "Change banner" : "Upload banner"}
            <input type="file" accept="image/*" onChange={(event) => handleImageChange(event, setBannerUrl)} className="hidden" />
          </label>
        </div>

        <label className="block text-sm font-medium text-[var(--muted)]">
          WhatsApp number (used for Buy Now)
          <input
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder={profile.phone}
            className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-[var(--muted)]">
            Leave blank to use your profile phone ({profile.phone}).
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : existingStore ? "Save changes" : "Create store"}
          </button>
          {existingStore ? (
            <Link href="/stores/manage" className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold">
              Back to manage
            </Link>
          ) : null}
        </div>
      </form>
    </div>
  );
}
