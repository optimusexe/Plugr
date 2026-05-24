import { NextResponse } from "next/server";
import { upsertProfile } from "@/lib/profile-store";
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
      payload.mode,
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<RegisterPayload>;

    if (!isValid(payload)) {
      return NextResponse.json(
        { error: "Missing required fields. Complete all required registration fields." },
        { status: 400 },
      );
    }

    const profile = await upsertProfile(payload);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to complete registration." });
    logApiError("api/register", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
