import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { getStoreBySlug, updateStore, deleteStore } from "@/lib/store-store";
import { getProfileByUserId } from "@/lib/profile-store";
import { isVerifiedProvider } from "@/lib/verified";

type RouteContext = { params: Promise<{ slug: string }> };

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const store = await getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }
    return NextResponse.json({ store });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to load store." });
    logApiError("api/stores/[slug]/GET", resolved, error);
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

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }
    if (!isVerifiedProvider(profile)) {
      return NextResponse.json(
        { error: "Only verified providers can edit a store." },
        { status: 403 },
      );
    }

    const { slug } = await params;
    const store = await getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }
    if (store.providerId !== profile.id) {
      return NextResponse.json({ error: "You can only edit your own store." }, { status: 403 });
    }

    const payload = (await request.json()) as {
      name?: string;
      tagline?: string;
      description?: string;
      bannerUrl?: string;
      logoUrl?: string;
      whatsapp?: string;
    };

    if (payload.name !== undefined && !payload.name.trim()) {
      return NextResponse.json({ error: "Store name cannot be empty." }, { status: 400 });
    }
    if (payload.bannerUrl !== undefined && payload.bannerUrl && !isHttpUrl(payload.bannerUrl)) {
      return NextResponse.json({ error: "Invalid banner image." }, { status: 400 });
    }
    if (payload.logoUrl !== undefined && payload.logoUrl && !isHttpUrl(payload.logoUrl)) {
      return NextResponse.json({ error: "Invalid logo image." }, { status: 400 });
    }

    const updated = await updateStore(store.id, {
      name: payload.name,
      tagline: payload.tagline,
      description: payload.description,
      bannerUrl: payload.bannerUrl,
      logoUrl: payload.logoUrl,
      whatsapp: payload.whatsapp,
    });

    return NextResponse.json({ store: updated });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to update store." });
    logApiError("api/stores/[slug]/PATCH", resolved, error);
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

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const { slug } = await params;
    const store = await getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }
    if (store.providerId !== profile.id) {
      return NextResponse.json({ error: "You can only delete your own store." }, { status: 403 });
    }

    const deleted = await deleteStore(store.id);
    if (!deleted) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to delete store." });
    logApiError("api/stores/[slug]/DELETE", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
