import { NextResponse } from "next/server";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { recordAnalyticsEvent } from "@/lib/analytics-store";
import type { AnalyticsEventType } from "@/lib/types";

const VALID_EVENT_TYPES: AnalyticsEventType[] = [
  "profile_view",
  "contact_click",
  "search_appearance",
  "product_view",
];

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      providerId?: string;
      eventType?: AnalyticsEventType;
      metadata?: Record<string, unknown>;
      visitorId?: string;
    };

    if (!payload.providerId || !payload.eventType) {
      return NextResponse.json({ error: "providerId and eventType are required." }, { status: 400 });
    }

    if (!VALID_EVENT_TYPES.includes(payload.eventType)) {
      return NextResponse.json({ error: "Invalid eventType." }, { status: 400 });
    }

    const event = await recordAnalyticsEvent({
      providerId: payload.providerId,
      eventType: payload.eventType,
      metadata: payload.metadata,
      visitorId: payload.visitorId,
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to track event." });
    logApiError("api/provider/analytics/track/POST", resolved, error);
    return NextResponse.json({ error: resolved.message, code: resolved.code, requestId: resolved.requestId }, { status: resolved.status });
  }
}
