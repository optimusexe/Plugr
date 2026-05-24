import { NextRequest, NextResponse } from "next/server";
import {
  closeSupportConversation,
  getSupportConversationView,
} from "@/lib/support-store";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // Verify admin is authenticated
    const admin = await getCurrentAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load conversation
    const conversation = await getSupportConversationView(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Close the conversation
    await closeSupportConversation(conversationId);

    // Return updated conversation view
    const updatedConversation = await getSupportConversationView(conversationId);

    return NextResponse.json(updatedConversation);
  } catch (error) {
    const resolved = resolveApiError(error);
    logApiError("POST /api/admin/support/conversations/[id]/close", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}
