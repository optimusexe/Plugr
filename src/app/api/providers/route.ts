import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findProviders } from "@/lib/profile-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const authCookie = (await cookies()).get("plugr_user_id")?.value;
    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const verifiedOnly = searchParams.get("verified") === "1";

    const providers = await findProviders(query, verifiedOnly);
    return NextResponse.json({ providers }, {
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load providers." });
    logApiError("api/providers", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
