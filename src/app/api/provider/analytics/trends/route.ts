import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { getViewsTrend } from "@/lib/analytics-store";
import { getProfileByUserId } from "@/lib/profile-store";

export async function GET(request: Request) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const clampedDays = Math.min(90, Math.max(1, days));

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: "No provider profile found." }, { status: 404 });
    }

    const trends = await getViewsTrend(profile.id, clampedDays);
    return NextResponse.json({ trends });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load analytics trends." });
    logApiError("api/provider/analytics/trends/GET", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
