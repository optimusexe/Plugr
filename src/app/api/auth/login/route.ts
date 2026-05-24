import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-store";
import { getProfileByUserId } from "@/lib/profile-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const { user, verified } = await authenticateUser(body.email, body.password);
    const profile = await getProfileByUserId(user.id);
    
    if (!verified) {
      return NextResponse.json(
        { error: "Account not verified. Please verify your email to continue.", userId: user.id },
        { status: 403 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      profileComplete: Boolean(profile),
    });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 400,
      defaultMessage: "Unable to login right now.",
    });
    logApiError("api/auth/login", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
