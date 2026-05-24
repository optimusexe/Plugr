import { NextResponse } from "next/server";
import { getUsers } from "@/lib/auth-store";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { setAdminUserStatus } from "@/lib/admin-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function PATCH(request: Request) {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = (await request.json()) as { userId?: string; isAdmin?: boolean };

    if (!body.userId || typeof body.isAdmin !== "boolean") {
      return NextResponse.json({ error: "userId and isAdmin are required." }, { status: 400 });
    }

    if (adminUser.id === body.userId && body.isAdmin === false) {
      return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
    }

    if (body.isAdmin === false) {
      const users = await getUsers();
      const adminCount = users.filter((user) => user.isAdmin).length;
      const target = users.find((user) => user.id === body.userId);

      if (target?.isAdmin && adminCount <= 1) {
        return NextResponse.json({ error: "At least one admin must remain." }, { status: 400 });
      }
    }

    const user = await setAdminUserStatus(body.userId, body.isAdmin);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to update user admin status." });
    logApiError("api/admin/users", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}