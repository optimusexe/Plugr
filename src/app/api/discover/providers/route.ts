import { NextResponse } from "next/server";
import { findProviders } from "@/lib/profile-store";
import { getCachedAsync, setCachedAsync } from "@/lib/redis-cache";

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

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err: any) {
    console.error("/api/discover/providers error", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
