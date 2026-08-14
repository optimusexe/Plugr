import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import {
  deleteProduct,
  getProductById,
  incrementProductViews,
  updateProduct,
} from "@/lib/product-store";
import { getProfileById } from "@/lib/profile-store";
import { recordAnalyticsEvent } from "@/lib/analytics-store";
import { isProductCategory } from "@/lib/product-categories";

const MAX_IMAGES = 8;

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    const { id } = await params;

    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Fire-and-forget view tracking.
    incrementProductViews(product.id).catch(() => undefined);
    recordAnalyticsEvent({
      providerId: product.providerId,
      eventType: "product_view",
      metadata: { productId: product.id },
      visitorId: userId ?? undefined,
    }).catch(() => undefined);

    const provider = await getProfileById(product.providerId);

    return NextResponse.json({ product, provider });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load product." });
    logApiError("api/stores/products/[id]/GET", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
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

    if (product.providerUserId !== userId) {
      return NextResponse.json({ error: "You can only edit your own products." }, { status: 403 });
    }

    const payload = (await request.json()) as {
      name?: string;
      description?: string;
      price?: string;
      category?: string;
      imageUrls?: string[];
    };

    if (payload.name !== undefined && !String(payload.name).trim()) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    if (payload.category !== undefined && payload.category && !isProductCategory(payload.category)) {
      return NextResponse.json({ error: "Invalid product category." }, { status: 400 });
    }

    let imageUrls: string[] | undefined;
    if (Array.isArray(payload.imageUrls)) {
      imageUrls = payload.imageUrls.filter((url) => isHttpUrl(String(url).trim())).slice(0, MAX_IMAGES);
    }

    const updated = await updateProduct(id, {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      imageUrls,
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to update product." });
    logApiError("api/stores/products/[id]/PATCH", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
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

    if (product.providerUserId !== userId) {
      return NextResponse.json({ error: "You can only delete your own products." }, { status: 403 });
    }

    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to delete product." });
    logApiError("api/stores/products/[id]/DELETE", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
