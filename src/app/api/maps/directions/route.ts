import { NextResponse } from "next/server";
import { getTravelEstimates } from "@/lib/google-maps-service";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin")?.trim();
    const destination = searchParams.get("destination")?.trim();

    if (!origin || !destination) {
      return NextResponse.json({ error: "origin and destination are required." }, { status: 400 });
    }

    const result = await getTravelEstimates(origin, destination);
    return NextResponse.json(result);
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultMessage: "Unable to load travel estimates.",
    });
    logApiError("api/maps/directions", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
