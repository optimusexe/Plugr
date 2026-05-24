import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { createProviderReview, getReviewsByProvider, hasReviewForInteraction } from "@/lib/review-store";
import { getConsumerInteractionsForProvider } from "@/lib/interaction-store";
import { getProfileById, getProfileByUserId } from "@/lib/profile-store";
import { getUserById } from "@/lib/auth-store";

export async function GET(request: Request) {
  const userId = (await cookies()).get("plugr_user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");

  if (!providerId) {
    return NextResponse.json({ error: "providerId is required." }, { status: 400 });
  }

  const provider = await getProfileById(providerId);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  const reviews = await getReviewsByProvider(providerId);
  if (provider.userId === userId) {
    const reviewsWithReviewer = await Promise.all(
      reviews.map(async (review) => {
        const [reviewerProfile, reviewerUser] = await Promise.all([
          getProfileByUserId(review.consumerId),
          getUserById(review.consumerId),
        ]);

        return {
          ...review,
          reviewerName: reviewerProfile?.fullName || reviewerUser?.fullName || "Student",
          reviewerImage: reviewerProfile?.profileImage || null,
        };
      }),
    );

    return NextResponse.json({
      reviews: reviewsWithReviewer,
      canReview: false,
      reviewableInteractionId: null,
    });
  }

  const interactions = await getConsumerInteractionsForProvider(userId, providerId);

  let reviewableInteractionId: string | null = null;
  for (const interaction of interactions) {
    if (interaction.status === "consumer_declined" || interaction.status === "provider_declined") {
      continue;
    }

    const alreadyReviewed = await hasReviewForInteraction(interaction.id);
    if (!alreadyReviewed) {
      reviewableInteractionId = interaction.id;
      break;
    }
  }

  const reviewsWithReviewer = await Promise.all(
    reviews.map(async (review) => {
      const [reviewerProfile, reviewerUser] = await Promise.all([
        getProfileByUserId(review.consumerId),
        getUserById(review.consumerId),
      ]);

      return {
        ...review,
        reviewerName: reviewerProfile?.fullName || reviewerUser?.fullName || "Student",
        reviewerImage: reviewerProfile?.profileImage || null,
      };
    }),
  );

  return NextResponse.json({
    reviews: reviewsWithReviewer,
    canReview: Boolean(reviewableInteractionId),
    reviewableInteractionId,
  });
}

export async function POST(request: Request) {
  const consumerId = (await cookies()).get("plugr_user_id")?.value;
  if (!consumerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    providerId?: string;
    interactionId?: string;
    rating?: number;
    comment?: string;
  };

  if (!payload.providerId || !payload.interactionId || typeof payload.rating !== "number") {
    return NextResponse.json({ error: "providerId, interactionId and rating are required." }, { status: 400 });
  }

  const provider = await getProfileById(payload.providerId);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  if (provider.userId === consumerId) {
    return NextResponse.json({ error: "You cannot review your own profile." }, { status: 400 });
  }

  try {
    const review = await createProviderReview({
      interactionId: payload.interactionId,
      providerId: provider.id,
      providerUserId: provider.userId,
      consumerId,
      rating: payload.rating,
      comment: payload.comment,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 400,
      defaultMessage: "Unable to submit review.",
    });
    logApiError("api/reviews", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
