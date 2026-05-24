import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteAccount } from "@/lib/auth-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("plugr_user_id");

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { confirmed } = body as { confirmed?: boolean };

    if (!confirmed) {
      return NextResponse.json({ error: "Account deletion must be confirmed." }, { status: 400 });
    }

    await deleteAccount(userIdCookie.value);

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
