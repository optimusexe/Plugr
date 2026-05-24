import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { confirmInteraction, getInteractionById } from "@/lib/interaction-store";

type ConfirmRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: ConfirmRouteProps) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const interaction = await getInteractionById(id);
    if (!interaction) {
      return NextResponse.json({ error: "Interaction not found." }, { status: 404 });
    }

    const payload = (await request.json()) as {
      completed?: boolean;
      actor?: "consumer" | "provider";
    };

    if (typeof payload.completed !== "boolean") {
      return NextResponse.json({ error: "completed boolean is required." }, { status: 400 });
    }

    const actor = payload.actor || "consumer";
    if (actor === "consumer" && interaction.consumerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (actor === "provider" && interaction.providerUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await confirmInteraction({
      interactionId: id,
      actor,
      completed: payload.completed,
    });

    if (!updated) {
      return NextResponse.json({ error: "Could not update interaction." }, { status: 500 });
    }

    return NextResponse.json({ interaction: updated });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to update interaction." });
    logApiError("api/interactions/[id]/confirm", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
