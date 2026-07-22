import { NextResponse } from "next/server";
import { getProfileByUserId, upsertProfile } from "@/lib/profile-store";
import { getUserById } from "@/lib/auth-store";
import { syncVerificationChecksFromProfileState } from "@/lib/verification-store";
import { logApiError, resolveApiError } from "@/lib/api-error";
import type { RegisterPayload } from "@/lib/types";

function isValid(payload: Partial<RegisterPayload>): payload is RegisterPayload {
  return Boolean(
    payload.userId &&
      payload.fullName &&
      payload.faculty &&
      payload.department &&
      payload.level &&
      payload.phone &&
      payload.locationText &&
      payload.primarySkill &&
      payload.mode,
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const [profile, user] = await Promise.all([getProfileByUserId(userId), getUserById(userId)]);
    return NextResponse.json({ profile, user: user ? { isAdmin: user.isAdmin } : null }, {
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load profile." });
    logApiError("api/profile/GET", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<RegisterPayload>;

    if (!isValid(payload)) {
      return NextResponse.json({ error: "Missing required profile fields." }, { status: 400 });
    }

    const profile = await upsertProfile(payload);

    await syncVerificationChecksFromProfileState({
      userId: payload.userId,
      profilePhotoVerified: Boolean(profile.profileImage),
      profileComplete: Boolean(
        profile.fullName &&
          profile.faculty &&
          profile.department &&
          profile.level &&
          profile.phone &&
          profile.locationText &&
          profile.primarySkill &&
          profile.mode,
      ),
      bioVerified: Boolean(profile.bio && profile.primarySkill),
    });

    return NextResponse.json({ profile });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to save profile." });
    logApiError("api/profile/POST", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
