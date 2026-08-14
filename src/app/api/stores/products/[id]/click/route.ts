import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { getProductById, incrementProductClicks } from "@/lib/product-store";
import { getProfileById, incrementProfileContacts } from "@/lib/profile-store";
import { getStoreByProviderId } from "@/lib/store-store";
import { recordAnalyticsEvent } from "@/lib/analytics-store";
import { createInteraction } from "@/lib/interaction-store";

type RouteContext = { params: Promise<{ id: string }> };

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) {
    return digits;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const provider = await getProfileById(product.providerId);
    if (!provider) {
      return NextResponse.json({ error: "Provider not found." }, { status: 404 });
    }

    // Track the click: product click counter, provider contact counter, analytics event, interaction.
    incrementProductClicks(product.id).catch(() => undefined);
    incrementProfileContacts(provider.id).catch(() => undefined);
    recordAnalyticsEvent({
      providerId: provider.id,
      eventType: "contact_click",
      metadata: { productId: product.id, channel: "whatsapp" },
      visitorId: userId,
    }).catch(() => undefined);

    if (provider.userId !== userId) {
      createInteraction({
        providerId: provider.id,
        providerUserId: provider.userId,
        consumerId: userId,
        contactChannel: "whatsapp",
      }).catch(() => undefined);
    }

    const store = await getStoreByProviderId(provider.id);
    const whatsapp = store?.whatsapp?.trim() || provider.phone;
    const cleanPhone = formatPhoneForWhatsApp(whatsapp);
    const productUrl = `https://useplugr.app/p/${product.id}`;
    const message = encodeURIComponent(
      `Hi, I'm interested in getting this: ${productUrl} — still available?`,
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    return NextResponse.json({ waUrl });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to start chat." });
    logApiError("api/stores/products/[id]/click", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
