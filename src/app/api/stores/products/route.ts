import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { createProduct, getProducts } from "@/lib/product-store";
import { getProfileByUserId } from "@/lib/profile-store";
import { isVerifiedProvider } from "@/lib/verified";
import { isProductCategory } from "@/lib/product-categories";
import { getCachedAsync, setCachedAsync } from "@/lib/redis-cache";
import type { StoreProduct } from "@/lib/types";

const MAX_IMAGES = 8;

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") ?? "";
    const providerId = url.searchParams.get("provider") ?? "";
    const q = url.searchParams.get("q") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const cursorParam = url.searchParams.get("cursor") ?? "";

    const cacheKey = `stores:${category}:${providerId}:${q}:${limit}:${cursorParam || "start"}`;
    const cached = await getCachedAsync<{ products: StoreProduct[]; nextCursor?: string }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    let cursorObj: { created_at: string; id: string } | undefined;
    if (cursorParam) {
      try {
        const parsed = JSON.parse(Buffer.from(cursorParam, "base64").toString("utf8")) as {
          created_at?: unknown;
          id?: unknown;
        };
        if (typeof parsed.created_at === "string" && typeof parsed.id === "string") {
          cursorObj = { created_at: parsed.created_at, id: parsed.id };
        }
      } catch {}
    }

    const page = await getProducts({
      category: category || undefined,
      providerId: providerId || undefined,
      q: q || undefined,
      limit: Number.isFinite(limit) ? limit : 20,
      cursor: cursorObj,
    });

    const payload = { products: page.products, nextCursor: page.nextCursor };
    await setCachedAsync(cacheKey, payload, 30000);

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load products." });
    logApiError("api/stores/products/GET", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found. Complete profile setup first." }, { status: 404 });
    }

    if (!isVerifiedProvider(profile)) {
      return NextResponse.json(
        { error: "Only verified providers can list products on Stores. Get verified to start selling." },
        { status: 403 },
      );
    }

    const payload = (await request.json()) as {
      name?: string;
      description?: string;
      price?: string;
      category?: string;
      imageUrls?: string[];
    };

    const name = (payload.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    if (payload.category && !isProductCategory(payload.category)) {
      return NextResponse.json({ error: "Invalid product category." }, { status: 400 });
    }

    const imageUrls = Array.isArray(payload.imageUrls)
      ? payload.imageUrls.filter((url) => isHttpUrl(String(url).trim())).slice(0, MAX_IMAGES)
      : [];

    const product = await createProduct({
      providerId: profile.id,
      providerUserId: profile.userId,
      name,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      imageUrls,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to create product." });
    logApiError("api/stores/products/POST", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
