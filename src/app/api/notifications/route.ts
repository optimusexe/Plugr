import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getNotificationsForUser, getUnreadNotificationCount } from "@/lib/notification-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? (await cookies()).get("plugr_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(userId, 20),
      getUnreadNotificationCount(userId),
    ]);

    return NextResponse.json({ notifications, unreadCount }, {
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultMessage: "Unable to load notifications.",
    });
    logApiError("api/notifications", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}