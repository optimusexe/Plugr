import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { createStore, getStoreByProviderId, listStores } from "@/lib/store-store";
import { getProfileByUserId } from "@/lib/profile-store";
import { isVerifiedProvider } from "@/lib/verified";
import { getCachedAsync, setCachedAsync } from "@/lib/redis-cache";
import type { StoreWithStats } from "@/lib/types";

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const provider = url.searchParams.get("provider") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? "12");

    const cacheKey = `stores:list:${q}:${provider}:${limit}`;
    const cached = await getCachedAsync<{ stores: StoreWithStats[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const stores = await listStores({
      q: q || undefined,
      providerId: provider || undefined,
      limit: Number.isFinite(limit) ? limit : 12,
    });
    const payload = { stores };
    await setCachedAsync(cacheKey, payload, 30000);

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load stores." });
    logApiError("api/stores/GET", resolved, error);
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
        { error: "Only verified providers can set up a store." },
        { status: 403 },
      );
    }

    const existing = await getStoreByProviderId(profile.id);
    if (existing) {
      return NextResponse.json(
        { error: "You already have a store set up." },
        { status: 409 },
      );
    }

    const payload = (await request.json()) as {
      name?: string;
      tagline?: string;
      description?: string;
      bannerUrl?: string;
      logoUrl?: string;
      whatsapp?: string;
    };

    const name = (payload.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Store name is required." }, { status: 400 });
    }

    if (payload.bannerUrl && !isHttpUrl(payload.bannerUrl)) {
      return NextResponse.json({ error: "Invalid banner image." }, { status: 400 });
    }
    if (payload.logoUrl && !isHttpUrl(payload.logoUrl)) {
      return NextResponse.json({ error: "Invalid logo image." }, { status: 400 });
    }

    const store = await createStore({
      providerId: profile.id,
      providerUserId: profile.userId,
      name,
      tagline: payload.tagline,
      description: payload.description,
      bannerUrl: payload.bannerUrl,
      logoUrl: payload.logoUrl,
      whatsapp: payload.whatsapp,
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to create store." });
    logApiError("api/stores/POST", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
