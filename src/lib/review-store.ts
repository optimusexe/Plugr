import { execute, query } from "@/lib/azure/postgres";
import type { ProviderReview } from "@/lib/types";
import { countProviderCompletionSignals, getInteractionById } from "@/lib/interaction-store";
import { updateProfileCredibility, getProfileById } from "@/lib/profile-store";
import { mapRatingToPoints, computeProfileSetupScore, computeVerificationScore, computeReviewPoints } from "@/lib/credibility";
import { getStoreByProviderId } from "@/lib/store-store";

function makeId(): string {
  return `r_${Math.random().toString(36).slice(2, 10)}`;
}

type ReviewRow = {
  id: string;
  interaction_id: string;
  provider_id: string;
  provider_user_id: string;
  consumer_id: string;
  rating: number;
  comment: string | null;
  confidence_weight: number;
  created_at: string | Date;
};

function mapReviewRow(row: ReviewRow): ProviderReview {
  return {
    id: row.id,
    interactionId: row.interaction_id,
    providerId: row.provider_id,
    providerUserId: row.provider_user_id,
    consumerId: row.consumer_id,
    rating: row.rating,
    comment: row.comment ?? undefined,
    confidenceWeight: Number(row.confidence_weight),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function ensureReviewsTable(): Promise<void> {
  await execute(`
    create table if not exists reviews (
      id text primary key,
      interaction_id text not null unique,
      provider_id text not null,
      provider_user_id text not null,
      consumer_id text not null,
      rating integer not null,
      comment text null,
      confidence_weight numeric not null,
      created_at timestamptz not null default now()
    )
  `);
}

async function readReviewsFromDb(): Promise<ProviderReview[]> {
  await ensureReviewsTable();
  const result = await query<ReviewRow>(`select * from reviews order by created_at asc`);
  return result.rows.map(mapReviewRow);
}

export async function getReviews(): Promise<ProviderReview[]> {
  return readReviewsFromDb();
}

async function hasReviewForInteractionFromDb(interactionId: string): Promise<boolean> {
  await ensureReviewsTable();
  const result = await query<ReviewRow>(`select * from reviews where interaction_id = $1 limit 1`, [interactionId]);
  return result.rows.length > 0;
}

async function insertReviewIntoDb(review: ProviderReview): Promise<ProviderReview> {
  await ensureReviewsTable();
  const result = await query<ReviewRow>(
    `insert into reviews (
      id, interaction_id, provider_id, provider_user_id, consumer_id, rating, comment, confidence_weight, created_at
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz) returning *`,
    [
      review.id,
      review.interactionId,
      review.providerId,
      review.providerUserId,
      review.consumerId,
      review.rating,
      review.comment ?? null,
      review.confidenceWeight,
      review.createdAt,
    ],
  );

  return mapReviewRow(result.rows[0]);
}

function clampRating(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function calculateConfidenceWeight(consumerConfirmed: boolean, providerConfirmed: boolean): number {
  if (consumerConfirmed && providerConfirmed) {
    return 1;
  }
  if (consumerConfirmed) {
    return 0.75;
  }
  return 0.5;
}

export async function recomputeCredibility(providerId: string): Promise<void> {
  const reviews = await readReviewsFromDb();
  const providerReviews = reviews.filter((entry) => entry.providerId === providerId);

  // compute review-derived points (capped at 50)
  const reviewPoints = computeReviewPoints(providerReviews);

  // fetch profile and compute profile + verification contributions
  const profile = await getProfileById(providerId);
  const [store] = await Promise.all([
    getStoreByProviderId(providerId).catch(() => null),
  ]);
  const profileScore = computeProfileSetupScore(profile, Boolean(store)); // max 30
  const verificationScore = computeVerificationScore(profile); // 0 or 20

  const total = Math.min(100, profileScore + verificationScore + reviewPoints);

  await updateProfileCredibility(providerId, total);
}

export async function getReviewsByProvider(providerId: string): Promise<ProviderReview[]> {
  const reviews = await readReviewsFromDb();
  return reviews
    .filter((entry) => entry.providerId === providerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function hasReviewForInteraction(interactionId: string): Promise<boolean> {
  return hasReviewForInteractionFromDb(interactionId);
}

export async function createProviderReview(input: {
  interactionId: string;
  providerId: string;
  providerUserId: string;
  consumerId: string;
  rating: number;
  comment?: string;
}): Promise<ProviderReview> {
  const interaction = await getInteractionById(input.interactionId);
  if (!interaction) {
    throw new Error("Interaction not found.");
  }

  if (interaction.providerId !== input.providerId || interaction.consumerId !== input.consumerId) {
    throw new Error("Interaction does not match provider/consumer.");
  }

  if (!interaction.consumerConfirmed) {
    throw new Error("Only completed service interactions can be reviewed.");
  }

  const alreadyReviewed = await hasReviewForInteraction(input.interactionId);
  if (alreadyReviewed) {
    throw new Error("This interaction has already been reviewed.");
  }

  const now = new Date().toISOString();
  const review: ProviderReview = {
    id: makeId(),
    interactionId: input.interactionId,
    providerId: input.providerId,
    providerUserId: input.providerUserId,
    consumerId: input.consumerId,
    rating: clampRating(input.rating),
    comment: input.comment?.trim() || undefined,
    confidenceWeight: calculateConfidenceWeight(interaction.consumerConfirmed, interaction.providerConfirmed),
    createdAt: now,
  };

  await insertReviewIntoDb(review);

  await recomputeCredibility(input.providerId);
  return review;
}
