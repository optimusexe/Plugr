import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { closeSupportConversation, getSupportConversationView } from "@/lib/support-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // Get user ID from cookie
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("plugr_user_id");

    if (!userIdCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = userIdCookie.value;

    // Load conversation
    const conversation = await getSupportConversationView(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify user owns this conversation
    if (conversation.user?.id !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Close the conversation
    await closeSupportConversation(conversationId);

    // Return updated conversation view
    const updatedConversation = await getSupportConversationView(conversationId);

    return NextResponse.json(updatedConversation);
  } catch (error) {
    const resolved = resolveApiError(error);
    logApiError("POST /api/support/conversations/[id]/close", resolved, error);
    return NextResponse.json({ error: resolved.message }, { status: resolved.status });
  }
}
