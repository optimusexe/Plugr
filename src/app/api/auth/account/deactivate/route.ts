import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deactivateAccountWithNotify, reactivateAccountWithNotify, verifyUserPassword } from "@/lib/auth-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("plugr_user_id");

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const until = typeof body.until === "string" ? body.until : "";

    if (!until) {
      return NextResponse.json({ error: "Please choose when the account should reactivate." }, { status: 400 });
    }

    const updated = await deactivateAccountWithNotify(userIdCookie.value, until);
    return NextResponse.json({ success: true, deactivatedUntil: updated.deactivatedUntil });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 400,
      defaultMessage: "Unable to deactivate account.",
    });
    logApiError("POST /api/auth/account/deactivate", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("plugr_user_id");

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body as { password?: string };

    if (!password) {
      return NextResponse.json({ error: "Password is required to reactivate the account." }, { status: 400 });
    }

    const ok = await verifyUserPassword(userIdCookie.value, password).catch(() => false);
    if (!ok) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const updated = await reactivateAccountWithNotify(userIdCookie.value);
    return NextResponse.json({ success: true, deactivatedUntil: updated.deactivatedUntil ?? null });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 400,
      defaultMessage: "Unable to reactivate account.",
    });
    logApiError("DELETE /api/auth/account/deactivate", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}