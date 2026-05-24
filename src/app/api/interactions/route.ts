import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { createInteraction, getConsumerInteractionsForProvider } from "@/lib/interaction-store";
import { getProfileById } from "@/lib/profile-store";

export async function GET(request: Request) {
  try {
    const consumerId = (await cookies()).get("plugr_user_id")?.value;
    if (!consumerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    if (!providerId) {
      return NextResponse.json({ error: "providerId is required." }, { status: 400 });
    }

    const interactions = await getConsumerInteractionsForProvider(consumerId, providerId);
    return NextResponse.json({ interactions });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load interactions." });
    logApiError("api/interactions/GET", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}

export async function POST(request: Request) {
  try {
    const consumerId = (await cookies()).get("plugr_user_id")?.value;
    if (!consumerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as {
      providerId?: string;
      channel?: "call" | "whatsapp" | "email";
    };

    if (!payload.providerId || !payload.channel) {
      return NextResponse.json({ error: "providerId and channel are required." }, { status: 400 });
    }

    const provider = await getProfileById(payload.providerId);
    if (!provider) {
      return NextResponse.json({ error: "Provider not found." }, { status: 404 });
    }

    if (provider.userId === consumerId) {
      return NextResponse.json({ error: "You cannot create an interaction with your own profile." }, { status: 400 });
    }

    const interaction = await createInteraction({
      providerId: provider.id,
      providerUserId: provider.userId,
      consumerId,
      contactChannel: payload.channel,
    });

    return NextResponse.json({ interaction }, { status: 201 });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to create interaction." });
    logApiError("api/interactions/POST", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
