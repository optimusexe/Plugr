import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { markNotificationRead } from "@/lib/notification-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { userId?: string };
    const userId = body.userId ?? (await cookies()).get("plugr_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const notification = await markNotificationRead(id, userId);

    if (!notification) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultMessage: "Unable to update notification.",
    });
    logApiError("api/notifications/read", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}