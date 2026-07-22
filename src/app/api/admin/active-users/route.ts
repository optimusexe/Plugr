import { NextResponse } from "next/server";
import { query } from "@/lib/azure/postgres";
import { logApiError, resolveApiError } from "@/lib/api-error";

const WINDOWS: Record<string, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const windowParam = searchParams.get("window") ?? "7d";

  if (!WINDOWS[windowParam]) {
    return NextResponse.json({ error: "Invalid window. Use 24h, 7d, or 30d." }, { status: 400 });
  }

  try {
    const result = await query<{ count: string }>(
      `SELECT count(*) as count FROM profiles WHERE last_active_at >= now() - interval '${WINDOWS[windowParam]}'`,
    );
    const count = Number(result.rows[0]?.count ?? 0);
    return NextResponse.json({ window: windowParam, count });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 500,
      defaultMessage: "Failed to count active users.",
    });
    logApiError("api/admin/active-users", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
