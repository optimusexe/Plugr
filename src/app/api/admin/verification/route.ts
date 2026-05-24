import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { setProfileVerificationStatus, getProfileByUserId } from "@/lib/profile-store";
import { recomputeCredibility } from "@/lib/review-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

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

    return NextResponse.json({ profile: updated });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to update verification status." });
    logApiError("api/admin/verification", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}