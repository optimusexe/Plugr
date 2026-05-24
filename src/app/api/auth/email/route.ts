import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { changeEmail } from "@/lib/auth-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("plugr_user_id");

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail || typeof newEmail !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await changeEmail(userIdCookie.value, newEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    const resolved = resolveApiError(error);
    logApiError("POST /api/auth/email", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}
