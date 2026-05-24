import { NextResponse } from "next/server";
import { getUserById } from "@/lib/auth-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user: { id: user.id, fullName: user.fullName, email: user.email, verified: user.verified, isAdmin: user.isAdmin } });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load account profile." });
    logApiError("api/auth/me", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
