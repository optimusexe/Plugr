import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProfileByUserId, getProfileById } from "@/lib/profile-store";
import { recomputeCredibility } from "@/lib/review-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const cookieUserId = (await cookies()).get("plugr_user_id")?.value;
    const body = await request.json().catch(() => ({}));

    // prefer cookie auth, but allow client to send userId (existing pattern)
    const userId = cookieUserId ?? body.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await recomputeCredibility(profile.id);

    const updated = await getProfileById(profile.id);
    return NextResponse.json({ profile: updated });
  } catch (err) {
    const resolved = resolveApiError(err, { defaultStatus: 500, defaultMessage: "Unable to recompute credibility." });
    logApiError("api/profile/recompute", resolved, err);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}
