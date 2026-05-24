import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/profile-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const metrics = await getMetrics();
    return NextResponse.json({ metrics });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load metrics." });
    logApiError("api/metrics", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
