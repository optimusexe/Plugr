import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { setProfileVerificationStatus, getProfileByUserId, getProfilesByVerificationStatus, countProfilesByVerificationStatus } from "@/lib/profile-store";
import { getUserById } from "@/lib/auth-store";
import { getVerificationProgress } from "@/lib/verification-store";
import { recomputeCredibility } from "@/lib/review-store";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { delCached } from "@/lib/redis-cache";

export async function PATCH(request: Request) {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = (await request.json()) as { userId?: string; approved?: boolean };

    if (!body.userId || typeof body.approved !== "boolean") {
      return NextResponse.json({ error: "userId and approved are required." }, { status: 400 });
    }

    const profile = await getProfileByUserId(body.userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const updated = await setProfileVerificationStatus(body.userId, body.approved ? "verified" : "pending");
    if (!updated) {
      return NextResponse.json({ error: "Unable to update verification status." }, { status: 400 });
    }

    // Recompute credibility for the affected profile so the badge/score is applied immediately
    try {
      const profileForUser = await getProfileByUserId(body.userId);
      if (profileForUser) {
        await recomputeCredibility(profileForUser.id);
      }
    } catch (e) {
      // Log and continue — we don't want to block the admin action if recompute fails
      console.error("recomputeCredibility failed:", e);
    }

    await Promise.all([
      delCached("admin:verificationQueue"),
      delCached("admin:verifiedProfiles"),
      delCached("admin:overview"),
      delCached("admin:users"),
    ]);

    return NextResponse.json({ profile: updated });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to update verification status." });
    logApiError("api/admin/verification", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}

export async function GET(request: Request) {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = (url.searchParams.get("status") || "pending") as "pending" | "verified";
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || "10")));
    const offset = Math.max(0, Number(url.searchParams.get("offset") || "0"));

    if (status === "pending") {
      const total = await countProfilesByVerificationStatus("pending");
      const profiles = await getProfilesByVerificationStatus("pending", limit, offset);
      // fetch users and verification progress
      const rows = await Promise.all(
        profiles.map(async (profile) => {
          const user = await getUserById(profile.userId);
          const progress = await getVerificationProgress(profile.userId);
          return { user, profile, progress };
        }),
      );

      return NextResponse.json({ total, rows });
    }

    // verified
    const total = await countProfilesByVerificationStatus("verified");
    const profiles = await getProfilesByVerificationStatus("verified", limit, offset);
    const rows = await Promise.all(
      profiles.map(async (profile) => {
        const user = await getUserById(profile.userId);
        return { user, profile };
      }),
    );

    return NextResponse.json({ total, rows });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load verification list." });
    logApiError("api/admin/verification", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}