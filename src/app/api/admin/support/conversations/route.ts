import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getSupportConversationSummariesForAdmin } from "@/lib/support-store";
import { logApiError, resolveApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getSupportConversationSummariesForAdmin();
    return NextResponse.json({ conversations, adminUser: { id: adminUser.id, fullName: adminUser.fullName } });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load support inbox." });
    logApiError("api/admin/support/conversations/GET", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
