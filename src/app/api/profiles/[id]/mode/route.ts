import { NextResponse } from "next/server";
import { switchProfileMode } from "@/lib/profile-store";
import { logApiError, resolveApiError } from "@/lib/api-error";
import type { ProfileMode } from "@/lib/types";

function isProfileMode(mode: string): mode is ProfileMode {
  return mode === "provider" || mode === "requester" || mode === "both";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { mode?: string };

    if (!body.mode || !isProfileMode(body.mode)) {
      return NextResponse.json({ error: "Invalid mode supplied." }, { status: 400 });
    }

    const updated = await switchProfileMode(id, body.mode);

    if (!updated) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ profile: updated });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to switch profile mode." });
    logApiError("api/profiles/[id]/mode", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
