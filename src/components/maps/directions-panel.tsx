"use client";

import { useEffect, useMemo, useState } from "react";

type TravelMode = "walking" | "driving" | "transit";

type TravelEstimate = {
  mode: TravelMode;
  distanceText: string;
  distanceValue?: number;
  durationText: string;
  durationValue?: number;
};

type TravelEstimateResponse = {
  cached: boolean;
  estimates: Record<TravelMode, TravelEstimate>;
};

type DirectionsPanelProps = {
  destinationText: string;
  mapLink?: string;
};

const modeLabel: Record<TravelMode, string> = {
  walking: "Walk",
  driving: "Drive",
  transit: "Transit",
};

export function DirectionsPanel({ destinationText, mapLink }: DirectionsPanelProps) {
  const [mode, setMode] = useState<TravelMode>("walking");
  const [origin, setOrigin] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<Partial<Record<TravelMode, TravelEstimate>>>({});

  const destinationQuery = `${destinationText}, Lagos State University`;

  useEffect(() => {
    if (!origin) {
      setEstimates({});
      return;
    }

    const liveOrigin = origin;

    const controller = new AbortController();

    async function loadEstimates() {
      setLoadingEstimates(true);
      setEstimateError(null);

      try {
        const response = await fetch(
          `/api/maps/directions?origin=${encodeURIComponent(liveOrigin)}&destination=${encodeURIComponent(destinationQuery)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to load travel estimates.");
        }

        const data = (await response.json()) as TravelEstimateResponse;
        setEstimates(data.estimates || {});
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setEstimateError("Unable to load live travel times right now.");
        }
      } finally {
        setLoadingEstimates(false);
      }
    }

    loadEstimates();

    return () => controller.abort();
  }, [destinationQuery, origin]);

  const selectedEstimate = estimates[mode];

  const directionUrl = useMemo(() => {
    if (mapLink) {
      return mapLink;
    }

    const params = new URLSearchParams();
    params.set("api", "1");
    params.set("destination", destinationQuery);
    params.set("travelmode", mode);
    if (origin) {
      params.set("origin", origin);
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [destinationQuery, mapLink, mode, origin]);

  const embedUrl = useMemo(() => {
    if (mapLink && mapLink.includes("google.com/maps")) {
      return `${mapLink}${mapLink.includes("?") ? "&" : "?"}output=embed`;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(destinationQuery)}&output=embed`;
  }, [destinationQuery, mapLink]);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported on this device.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setOrigin(`${lat},${lng}`);
        setLocating(false);
      },
      () => {
        setLocationError("Could not read your current location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Directions</p>
          <h2 className="mt-1 text-lg font-semibold">Campus route view</h2>
        </div>
        <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-[var(--muted)]">
          {loadingEstimates
            ? "Calculating..."
            : selectedEstimate
              ? `${modeLabel[mode]} ${selectedEstimate.durationText}`
              : `${modeLabel[mode]} estimate`}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {(["walking", "driving", "transit"] as TravelMode[]).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => setMode(nextMode)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              mode === nextMode
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-black/15 bg-white text-[var(--ink)] hover:bg-black/5"
            }`}
          >
            {modeLabel[nextMode]}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
        <iframe
          title="Provider location map"
          src={embedUrl}
          className="h-64 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {locating ? "Locating..." : "Use my live location"}
        </button>
        <a
          href={directionUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Open navigation
        </a>
      </div>

      {origin ? <p className="mt-2 text-xs text-[var(--muted)]">Live origin is active for directions.</p> : null}
      {estimateError ? <p className="mt-2 text-xs text-red-600">{estimateError}</p> : null}
      {selectedEstimate ? (
        <p className="mt-2 text-xs text-[var(--muted)]">
          Distance: {selectedEstimate.distanceText} • Duration: {selectedEstimate.durationText}
        </p>
      ) : null}
      {locationError ? <p className="mt-2 text-xs text-red-600">{locationError}</p> : null}
    </section>
  );
}
