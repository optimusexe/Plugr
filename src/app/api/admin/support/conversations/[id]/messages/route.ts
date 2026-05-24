import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { addSupportMessage, getSupportConversationById, getSupportConversationView } from "@/lib/support-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, context: { params: Params }) {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const conversation = await getSupportConversationById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const view = await getSupportConversationView(id);
    return NextResponse.json({ conversation: view?.conversation ?? null, messages: view?.messages ?? [], user: view?.user ?? null, profile: view?.profile ?? null });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load conversation." });
    logApiError("api/admin/support/conversations/[id]/messages/GET", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}

export async function POST(request: Request, context: { params: Params }) {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const conversation = await getSupportConversationById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const payload = (await request.json().catch(() => ({}))) as { message?: string };
    const message = await addSupportMessage({ conversationId: id, senderRole: "admin", senderUserId: adminUser.id, assignedAdminId: adminUser.id, body: payload.message || "" });
    const view = await getSupportConversationView(id);

    return NextResponse.json({ message, conversation: view?.conversation ?? null, messages: view?.messages ?? [] }, { status: 201 });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to send reply." });
    logApiError("api/admin/support/conversations/[id]/messages/POST", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
