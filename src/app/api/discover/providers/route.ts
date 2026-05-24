import { NextResponse } from "next/server";
import { findProviders } from "@/lib/profile-store";
import { getCached, setCached } from "@/lib/simple-cache";
import { getCachedAsync, setCachedAsync } from "@/lib/redis-cache";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const verifiedOnly = url.searchParams.get("verifiedOnly") === "true";
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const offset = Number(url.searchParams.get("offset") ?? "0");

    const cacheKey = `discover:${q}:${verifiedOnly}:${limit}:${offset}`;
    const cached = await getCachedAsync<{ providers: any[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // support keyset cursor
    const cursorParam = url.searchParams.get("cursor");
    let cursorObj: { score: number; updatedAt: string; id: string } | undefined;
    if (cursorParam) {
      try {
        cursorObj = JSON.parse(Buffer.from(cursorParam, "base64").toString("utf8"));
      } catch {}
    }

    const result = await findProviders(q, verifiedOnly, limit, cursorObj ?? undefined);
    const payload = { providers: result.providers as any[], nextCursor: result.nextCursor };
    await setCachedAsync(cacheKey, payload, 30000);

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("/api/discover/providers error", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
