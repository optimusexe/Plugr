import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteAccountWithNotify, verifyUserPassword } from "@/lib/auth-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("plugr_user_id");

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { confirmed, password } = body as { confirmed?: boolean; password?: string };

    if (!confirmed) {
      return NextResponse.json({ error: "Account deletion must be confirmed." }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required to delete the account." }, { status: 400 });
    }

    const ok = await verifyUserPassword(userIdCookie.value, password).catch(() => false);
    if (!ok) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    await deleteAccountWithNotify(userIdCookie.value);

    // Clear the user's session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("plugr_user_id", "", { path: "/", maxAge: 0 });

    return response;
  } catch (error) {
    const resolved = resolveApiError(error);
    logApiError("DELETE /api/auth/account", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}
