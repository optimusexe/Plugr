import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/auth-store";
import { createNotification } from "@/lib/notification-store";
import { logApiError, resolveApiError } from "@/lib/api-error";
import type { AuthRegisterPayload } from "@/lib/types";

function isPayloadValid(payload: Partial<AuthRegisterPayload>): payload is AuthRegisterPayload {
  return Boolean(payload.fullName && payload.email && payload.password && payload.password.length >= 6);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<AuthRegisterPayload>;

  if (!isPayloadValid(payload)) {
    return NextResponse.json(
      { error: "Enter full name, valid email, and password of at least 6 characters." },
      { status: 400 },
    );
  }

  try {
    const { user, verificationCode } = await registerAccount(payload);

    await createNotification(
      user.id,
      "Welcome to Plugr",
      "Your account is ready. Complete your profile to start connecting with students and customers on campus.",
      "/profile/setup",
      "system",
    ).catch(() => undefined);

    return NextResponse.json(
      {
        userId: user.id,
        requiresVerification: true,
      },
      { status: 201 },
    );
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 400,
      defaultMessage: "Unable to create account.",
    });
    logApiError("api/auth/register", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
