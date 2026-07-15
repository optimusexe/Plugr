import { NextResponse } from "next/server";
import { findProviders } from "@/lib/profile-store";
import { getCached, setCached } from "@/lib/simple-cache";
import { getCachedAsync, setCachedAsync } from "@/lib/redis-cache";
import { recordAnalyticsEvent } from "@/lib/analytics-store";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const verifiedOnly = url.searchParams.get("verifiedOnly") === "true";
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const cursorParam = url.searchParams.get("cursor") ?? "";

    const cacheKey = `discover:${q}:${verifiedOnly}:${limit}:${cursorParam || "start"}`;
    const cached = await getCachedAsync<{ providers: any[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // support keyset cursor
    let cursorObj: unknown;
    if (cursorParam) {
      try {
        cursorObj = JSON.parse(Buffer.from(cursorParam, "base64").toString("utf8"));
      } catch {}
    }

    const result = await findProviders(q, verifiedOnly, limit, cursorObj as any);
    const payload = { providers: result.providers as any[], nextCursor: result.nextCursor };
    await setCachedAsync(cacheKey, payload, 30000);

    // Track search appearances (fire-and-forget)
    if (result.providers.length > 0) {
      Promise.all(
        result.providers.map((p: any) =>
          recordAnalyticsEvent({
            providerId: p.id,
            eventType: "search_appearance",
            metadata: q ? { searchQuery: q } : undefined,
          })
        )
      ).catch(() => undefined);
    }

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("/api/discover/providers error", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
