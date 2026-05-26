import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { deleteBroadcastNotifications } from "@/lib/notification-store";

export async function DELETE(_request: Request, context: { params: Promise<{ broadcastId: string }> }) {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { broadcastId } = await context.params;
  if (!broadcastId) {
    return NextResponse.json({ error: "broadcastId is required." }, { status: 400 });
  }

  const deletedCount = await deleteBroadcastNotifications(broadcastId);
  return NextResponse.json({ success: true, deletedCount });
}