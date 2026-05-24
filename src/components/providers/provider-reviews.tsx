"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ProviderReview = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerName?: string;
  reviewerImage?: string | null;
};

type ProviderReviewsProps = {
  providerId: string;
  showComposer?: boolean;
  sectionTitle?: string;
};

function visualStars(rating: number): string {
  const safe = Math.max(1, Math.min(5, Math.round(rating)));
  return `${"★".repeat(safe)}${"☆".repeat(5 - safe)}`;
}

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

export function ProviderReviews({ providerId, showComposer = true, sectionTitle = "Reviews" }: ProviderReviewsProps) {
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewableInteractionId, setReviewableInteractionId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadReviews() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews?providerId=${providerId}`);
      if (!response.ok) {
        throw new Error("Unable to load reviews.");
      }

      const data = (await response.json()) as {
        reviews: ProviderReview[];
        canReview: boolean;
        reviewableInteractionId: string | null;
      };

      setReviews(data.reviews || []);
      setCanReview(Boolean(data.canReview));
      setReviewableInteractionId(data.reviewableInteractionId || null);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [providerId]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  async function handleLogContact() {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, channel: "call" }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Unable to start a contact session.");
      }

      setMessage("Contact session logged. You can now submit your review.");
      await loadReviews();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmAndReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!reviewableInteractionId) {
      setError("No reviewable interaction found yet.");
      return;
    }

    setBusy(true);

    try {
      const confirmResponse = await fetch(`/api/interactions/${reviewableInteractionId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: "consumer", completed: true }),
      });

      if (!confirmResponse.ok) {
        const confirmData = (await confirmResponse.json()) as { error?: string };
        throw new Error(confirmData.error || "Unable to confirm service completion.");
      }

      const reviewResponse = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          interactionId: reviewableInteractionId,
          rating,
          comment,
        }),
      });

      if (!reviewResponse.ok) {
        const reviewData = (await reviewResponse.json()) as { error?: string };
        throw new Error(reviewData.error || "Unable to submit review.");
      }

      setComment("");
      setRating(5);
      setMessage("Review submitted successfully.");
      await loadReviews();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{sectionTitle}</p>
        <p className="text-xs text-[var(--muted)]">
          {averageRating ? `${averageRating}/5 from ${reviews.length} reviews` : "No reviews yet"}
        </p>
      </div>

      {showComposer && canReview ? (
        <form onSubmit={handleConfirmAndReview} className="mt-3 space-y-2 rounded-xl border border-black/10 bg-[var(--card)] p-3">
          <p className="text-sm font-semibold">Confirm service completion and leave a review</p>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="rounded-lg border border-black/15 px-3 py-2 text-sm"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Fair</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Bad</option>
            </select>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="How was the service?"
              className="rounded-lg border border-black/15 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Submitting..." : "Confirm and submit review"}
          </button>
        </form>
      ) : showComposer ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Contact this provider first. After service completion, you can submit one review.
        </p>
      ) : null}

      {showComposer && !canReview ? (
        <button
          type="button"
          disabled={busy}
          onClick={handleLogContact}
          className="mt-3 rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? "Starting..." : "Start contact and write review"}
        </button>
      ) : null}

      {loading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <article key={`review-skeleton-${index}`} className="rounded-xl border border-black/10 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-2 w-16 rounded" />
                  </div>
                </div>
                <div className="skeleton h-3 w-20 rounded" />
              </div>
              <div className="mt-2 skeleton h-3 w-full rounded" />
            </article>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-3 space-y-2">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-xl border border-black/10 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {review.reviewerImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={review.reviewerImage} alt={review.reviewerName || "Reviewer"} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
                    {initialsFromName(review.reviewerName || "Student")}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{review.reviewerName || "Student"}</p>
                  <p className="text-xs text-[var(--muted)]">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-amber-500" aria-label={`${review.rating} stars`}>
                {visualStars(review.rating)}
              </p>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{review.comment || "No comment"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
