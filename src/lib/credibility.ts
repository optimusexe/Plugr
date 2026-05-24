import type { StudentProfile, ProviderReview } from "@/lib/types";

/**
 * Map a 1-5 rating to points (linear mapping 1 -> 0.5 ... 5 -> 2.5).
 */
export function mapRatingToPoints(rating: number): number {
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));
  return Math.round(0.5 * clamped * 100) / 100;
}

/**
 * Compute profile setup score out of 30.
 * Allocations:
 * - fullName: 6
 * - profileImage: 6
 * - bio: 5
 * - primarySkill: 4
 * - contact (phone or email): 4
 * - products (any): 5
 */
export function computeProfileSetupScore(profile: StudentProfile | null | undefined): number {
  if (!profile) return 0;
  let score = 0;
  if (profile.fullName && profile.fullName.trim().length > 0) score += 6;
  if (profile.profileImage && profile.profileImage.trim().length > 0) score += 6;
  if (profile.bio && profile.bio.trim().length > 0) score += 5;
  if (profile.primarySkill && profile.primarySkill.trim().length > 0) score += 4;
  if ((profile.phone && profile.phone.trim().length > 0) || (profile.email && profile.email?.trim().length > 0)) score += 4;
  if (Array.isArray(profile.products) && profile.products.length > 0) score += 5;
  return Math.round(score * 10) / 10;
}

/**
 * Verification score: 20 points when profile is verified.
 */
export function computeVerificationScore(profile: StudentProfile | null | undefined): number {
  if (!profile) return 0;
  return profile.verificationStatus === "verified" ? 20 : 0;
}

/**
 * Compute review-derived points. For each review, map rating -> points and multiply by confidenceWeight.
 * Total is capped at 50.
 */
export function computeReviewPoints(reviews: ProviderReview[] | null | undefined): number {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, r) => {
    const pts = mapRatingToPoints(Number(r.rating || 0));
    const weight = typeof r.confidenceWeight === "number" && !Number.isNaN(r.confidenceWeight) ? r.confidenceWeight : 1;
    return acc + pts * weight;
  }, 0);
  const capped = Math.min(50, total);
  return Math.round(capped * 10) / 10;
}

/**
 * Combine profile, verification and reviews into total credibility (0..100).
 */
export function calculateTotalCredibility(profile: StudentProfile | null | undefined, reviews: ProviderReview[] | null | undefined): number {
  const profileScore = computeProfileSetupScore(profile);
  const verificationScore = computeVerificationScore(profile);
  const reviewScore = computeReviewPoints(reviews);
  const total = profileScore + verificationScore + reviewScore;
  return Math.round(Math.min(100, total) * 10) / 10;
}
