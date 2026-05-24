import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/auth-store";
import { addSupportMessage, getSupportConversationById, getSupportConversationView, getSupportConversationViewForUser, createOrResumeSupportConversation } from "@/lib/support-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      const conversation = await getSupportConversationById(conversationId);
      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }

      const view = await getSupportConversationView(conversationId);
      return NextResponse.json({ conversation: view?.conversation ?? null, messages: view?.messages ?? [], user: view?.user ?? null, profile: view?.profile ?? null });
    }

    const view = await getSupportConversationViewForUser(user.id);
    return NextResponse.json({ conversation: view?.conversation ?? null, messages: view?.messages ?? [], user: view?.user ?? null, profile: view?.profile ?? null });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load support conversation." });
    logApiError("api/support/conversations/GET", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}

export async function POST(request: Request) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json().catch(() => ({}))) as { subject?: string; message?: string; conversationId?: string };

    if (payload.conversationId) {
      const conversation = await getSupportConversationById(payload.conversationId);
      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }

      if (conversation.status === "closed") {
        return NextResponse.json({ error: "This conversation is closed. Start a new chat to continue." }, { status: 409 });
      }

      await addSupportMessage({ conversationId: conversation.id, senderRole: "user", senderUserId: user.id, body: payload.message || "" });
      const view = await getSupportConversationView(conversation.id);
      if (!view) {
        return NextResponse.json({ error: "Unable to load support conversation." }, { status: 500 });
      }

      return NextResponse.json({ conversation: view.conversation, messages: view.messages, user: view.user ?? null, profile: view.profile ?? null });
    }

    const view = await createOrResumeSupportConversation({ userId: user.id, subject: payload.subject, message: payload.message || "" });
    return NextResponse.json({ conversation: view.conversation, messages: view.messages, user: view.user ?? null, profile: view.profile ?? null }, { status: 201 });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to start support chat." });
    logApiError("api/support/conversations/POST", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
