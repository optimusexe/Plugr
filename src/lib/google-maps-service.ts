import { execute, query } from "@/lib/azure/postgres";
import { getGoogleMapsApiKey } from "@/lib/azure/config";

type TravelMode = "walking" | "driving" | "transit";

type TravelEstimate = {
  mode: TravelMode;
  distanceText: string;
  distanceValue?: number;
  durationText: string;
  durationValue?: number;
};

type CachedTravelEstimateRow = {
  cache_key: string;
  origin_text: string;
  destination_text: string;
  payload: unknown;
  expires_at: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
};

type DistanceMatrixResult = {
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
      duration_in_traffic?: { text: string; value: number };
    }>;
  }>;
  status: string;
};

let cacheTableReady: Promise<void> | null = null;

function normalizeLocation(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function createCacheKey(origin: string, destination: string): string {
  return `${normalizeLocation(origin).toLowerCase()}::${normalizeLocation(destination).toLowerCase()}`;
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function ensureCacheTable(): Promise<void> {
  if (!cacheTableReady) {
    cacheTableReady = execute(`
      create table if not exists map_travel_estimate_cache (
        cache_key text primary key,
        origin_text text not null,
        destination_text text not null,
        payload jsonb not null,
        expires_at timestamptz not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `)
      .then(async () => {
        await execute(`create index if not exists map_travel_estimate_cache_expires_idx on map_travel_estimate_cache (expires_at)`);
      })
      .catch((error) => {
        cacheTableReady = null;
        throw error;
      });
  }

  await cacheTableReady;
}

async function readCachedEstimates(origin: string, destination: string): Promise<Record<TravelMode, TravelEstimate> | null> {
  await ensureCacheTable();
  const cacheKey = createCacheKey(origin, destination);
  const result = await query<CachedTravelEstimateRow>(
    `select * from map_travel_estimate_cache where cache_key = $1 and expires_at > now() limit 1`,
    [cacheKey],
  );

  const row = result.rows[0];
  if (!row || !row.payload) {
    return null;
  }

  return row.payload as Record<TravelMode, TravelEstimate>;
}

async function writeCachedEstimates(
  origin: string,
  destination: string,
  payload: Record<TravelMode, TravelEstimate>,
): Promise<void> {
  await ensureCacheTable();
  const cacheKey = createCacheKey(origin, destination);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await execute(
    `insert into map_travel_estimate_cache (
      cache_key, origin_text, destination_text, payload, expires_at, created_at, updated_at
    ) values (
      $1, $2, $3, $4::jsonb, $5::timestamptz, now(), now()
    ) on conflict (cache_key) do update set
      origin_text = excluded.origin_text,
      destination_text = excluded.destination_text,
      payload = excluded.payload,
      expires_at = excluded.expires_at,
      updated_at = now()`,
    [cacheKey, normalizeLocation(origin), normalizeLocation(destination), JSON.stringify(payload), expiresAt],
  );
}

async function fetchDistanceMatrix(origin: string, destination: string, mode: TravelMode): Promise<TravelEstimate> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is required.");
  }

  const params = new URLSearchParams({
    origins: normalizeLocation(origin),
    destinations: normalizeLocation(destination),
    mode,
    key: apiKey,
    units: "metric",
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load travel estimates.");
  }

  const data = (await response.json()) as DistanceMatrixResult;
  if (data.status !== "OK") {
    throw new Error("Unable to load travel estimates.");
  }

  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK" || !element.distance || !element.duration) {
    throw new Error("Unable to load travel estimates.");
  }

  return {
    mode,
    distanceText: element.distance.text,
    distanceValue: element.distance.value,
    durationText: element.duration.text,
    durationValue: element.duration.value,
  };
}

export async function getTravelEstimates(origin: string, destination: string): Promise<{ cached: boolean; estimates: Record<TravelMode, TravelEstimate> }> {
  const normalizedOrigin = normalizeLocation(origin);
  const normalizedDestination = normalizeLocation(destination);

  if (!normalizedOrigin || !normalizedDestination) {
    throw new Error("Origin and destination are required.");
  }

  const cached = await readCachedEstimates(normalizedOrigin, normalizedDestination);
  if (cached) {
    return { cached: true, estimates: cached };
  }

  const [walking, driving, transit] = await Promise.all([
    fetchDistanceMatrix(normalizedOrigin, normalizedDestination, "walking"),
    fetchDistanceMatrix(normalizedOrigin, normalizedDestination, "driving"),
    fetchDistanceMatrix(normalizedOrigin, normalizedDestination, "transit"),
  ]);

  const estimates = {
    walking,
    driving,
    transit,
  } satisfies Record<TravelMode, TravelEstimate>;

  await writeCachedEstimates(normalizedOrigin, normalizedDestination, estimates);

  return { cached: false, estimates };
}

export function formatEstimateModeText(estimate: TravelEstimate | undefined, fallback: string): string {
  if (!estimate) {
    return fallback;
  }

  return estimate.durationText;
}
