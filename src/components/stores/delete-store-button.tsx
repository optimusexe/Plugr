"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteStoreButtonProps = {
  storeSlug: string;
  productCount: number;
};

export function DeleteStoreButton({ storeSlug, productCount }: DeleteStoreButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/stores/${storeSlug}`, { method: "DELETE" });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to delete store.");
      }
      router.push("/stores");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete store.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
      >
        Delete store
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-display text-xl font-bold">Delete this store?</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This will permanently remove your store{productCount > 0 ? ` and its ${productCount} product${productCount === 1 ? "" : "s"}` : ""}. This action cannot be undone.
            </p>
            {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete store"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}