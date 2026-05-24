import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { changePassword } from "@/lib/auth-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("plugr_user_id");

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Both password fields are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    await changePassword(userIdCookie.value, oldPassword, newPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    const resolved = resolveApiError(error);
    logApiError("POST /api/auth/password", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}
