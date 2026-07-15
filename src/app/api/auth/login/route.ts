import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-store";
import { getProfileByUserId, updateProfileLastActive } from "@/lib/profile-store";
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

    // Update last active timestamp (fire-and-forget)
    updateProfileLastActive(user.id).catch(() => undefined);

    return NextResponse.json({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      deactivatedUntil: user.deactivatedUntil,
      profileComplete: Boolean(profile),
    });
  } catch (error) {
    const maybeAccountError = error as { code?: string; message?: string };
    if (maybeAccountError?.code === "ACCOUNT_DEACTIVATED" && maybeAccountError.message) {
      return NextResponse.json({ error: maybeAccountError.message }, { status: 403 });
    }

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
