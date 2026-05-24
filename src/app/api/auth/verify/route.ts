import { NextResponse } from "next/server";
import { resendAccountVerificationCode, verifyAccount } from "@/lib/auth-store";
import { completeVerificationCheck } from "@/lib/verification-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

function isSchoolEmail(value?: string | null): boolean {
  return Boolean(value && value.toLowerCase().endsWith("@st.lasu.edu.ng"));
}

export async function POST(request: Request) {
  const body = (await request.json()) as { action?: "verify" | "resend"; userId?: string; code?: string };

  if (body.action === "resend") {
    if (!body.userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    try {
      await resendAccountVerificationCode(body.userId);
      return NextResponse.json({ userId: body.userId, resent: true });
    } catch (error) {
      const resolved = resolveApiError(error, {
        defaultStatus: 400,
        defaultMessage: "Unable to resend verification code.",
      });
      logApiError("api/auth/verify", resolved, error);
      return NextResponse.json(
        { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
        { status: resolved.status },
      );
    }
  }

  if (!body.userId || !body.code) {
    return NextResponse.json({ error: "userId and code are required." }, { status: 400 });
  }

  try {
    const user = await verifyAccount(body.userId, body.code);
    if (isSchoolEmail(user.email)) {
      await completeVerificationCheck(user.id, "email_verified");
    }
    return NextResponse.json({ userId: user.id, verified: true });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 400,
      defaultMessage: "Unable to verify account.",
    });
    logApiError("api/auth/verify", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
