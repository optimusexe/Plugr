import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { broadcastNotification } from "@/lib/notification-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  const admin = await getCurrentAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      title?: string;
      message?: string;
      actionUrl?: string;
      target?: "all" | "specific";
      userIds?: string[];
    };

    if (!payload.title || !payload.message || !payload.target) {
      return NextResponse.json({ error: "Title, message, and target are required." }, { status: 400 });
    }

    if (payload.target === "specific" && (!payload.userIds || payload.userIds.length === 0)) {
      return NextResponse.json({ error: "Provide at least one user ID for specific targeting." }, { status: 400 });
    }

    const result = await broadcastNotification({
      title: payload.title,
      message: payload.message,
      actionUrl: payload.actionUrl,
      target: payload.target,
      userIds: payload.userIds,
    });

    return NextResponse.json({ success: true, recipientCount: result.recipientCount });
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultMessage: "Unable to broadcast notification.",
    });
    logApiError("api/admin/notifications/broadcast", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}