# Discover Page Algorithm — Plain Language

## Purpose

We want users to see the most useful providers first — not simply the people who signed up earliest. The Discover page shows providers who are most likely to match what the user needs: verified, experienced, up-to-date, and relevant to the search.

This document explains, in everyday language, how the system decides which providers to show and in what order.

## What we look at for every provider

- Verification: Has an admin verified this person? Verified accounts get a noticeable boost.
- Credibility score: A number from 0–100 that represents reviews, reliability, and profile quality. Higher is better.
- Search relevance: How well the provider's name, skills, and profile text match the user's search terms.
- Recent activity: Providers who recently updated their profile or were active get a small boost.
- Profile completeness: Complete profiles are preferred (this is part of the credibility score).

All of those inputs are combined into a single “relevance score” so we can compare providers easily.

## How the score works (conceptually)

We turn the inputs above into one number per provider. Higher numbers mean a better match. In plain terms:

- Being verified adds a strong, fixed bonus.
- A provider’s credibility contributes proportionally (so a 90-score provider helps a lot).
- If the user searched for something, providers who match those words get an extra boost.
- Newer activity gives a modest, decaying boost so that recently-updated providers surface more easily.

This single number is what we use to order the list.

## How providers are selected and shown

1. The system filters out people who don't offer services (only `provider` or `both` modes are considered).
2. Optional filters are applied (for example, only show verified providers if requested).
3. The database calculates the relevance score for every candidate row and orders the rows from highest to lowest score.
4. The API returns the top N providers (default is 20) in that order.

If the user asks for more results, the client asks the API for the next page and appends them. The client also removes duplicates by ID so the same provider never shows twice.

## Why we chose this approach

- It ensures quality-first results — verification and credibility matter more than signup order.
- Doing the scoring in the database keeps the system fast and scalable: we don’t load all profiles into the app server just to sort them.
- Keyset (cursor) pagination is efficient for large datasets and avoids slow OFFSET queries.

## What this looks like for users

- A verified provider with a complete profile and a 90 credibility score will appear before an unverified provider who signed up earlier.
- If someone searches for "graphic design," providers who list that skill and have matching profile text will appear higher.

## Tuning and control

The relative importance of verification, credibility, relevance, and recency is configurable. That means we can adjust weights over time to improve results based on what users click and contact.

## Summary

We rank providers by a single, transparent evaluation number that favors relevance, credibility, verification, and recent activity. The Discover page puts the most useful providers up front, not merely the oldest signups.
Discover page provider-ranking algorithm — explanation and implementation notes
-------------------------------------------------------------------------------

Goal
- Replace "latest signups first" with a relevance-driven ranking that returns useful provider results quickly and scalably.

High-level approach
1. Use a single parameterized SQL query (no full-table loads) to filter, score, sort, and paginate providers.
2. Score combines several signals: verification, credibility, textual relevance, location proximity, recency, and engagement.
3. Let Postgres compute the score (ORDER BY score DESC) so the database uses indexes and avoids large in-memory sorts.
4. Expose small page sizes (e.g., 20) and server-side pagination (offset/limit or keyset pagination).

Signals and normalization
- Verification boost:
  - Binary: verified -> 1, unverified -> 0
  - Weight: W_verification (e.g., 2.0)

- Credibility:
  - Numeric 0-100 in DB; normalize to 0-1: credibility_norm = credibility / 100
  - Weight: W_credibility (e.g., 1.5)

- Textual relevance:
  - Use PostgreSQL full-text search (`to_tsvector` + `plainto_tsquery`) or `pg_trgm` similarity for short queries.
  - Compute a `relevance_rank` via `ts_rank_cd` or `similarity()`; normalize to 0-1.
  - Weight: W_relevance (e.g., 1.8)

- Proximity score:
  - Given user location (lat/lng) and provider lat/lng, compute haversine distance -> distance_km.
  - Normalize: proximity_score = max(0, 1 - (distance_km / maxDistanceKm)), where maxDistanceKm is a cutoff (e.g., 100 km).
  - Weight: W_proximity (e.g., 1.6)

- Recency score:
  - Use an exponential decay on `updated_at` or `last_active_at`. Example:
    recency_score = exp(-age_days / T) where T controls decay (e.g., 30 days).
  - Weight: W_recency (e.g., 1.0)

- Engagement boost (optional):
  - Recent bookings, messages, or conversion rate; normalize to 0-1.
  - Weight: W_engagement (e.g., 0.8)

Score composition (SQL-friendly)
- score =
    (CASE WHEN verification_status='verified' THEN 1 ELSE 0 END) * W_verification
    + (credibility / 100.0) * W_credibility
    + (relevance_rank) * W_relevance
    + (proximity_score) * W_proximity
    + (recency_score) * W_recency
    + (engagement_norm) * W_engagement

Implementation blueprint (SQL pseudocode)
- Use parameterized query with filters: `q` (search text), `verifiedOnly`, optional `skill`, `lat`, `lng`, `radiusKm`, `page`, `pageSize`.
- Example (simplified):
  ```
  SELECT
    id, user_id, profile_image, full_name, primary_skill,
    credibility, verification_status, location_lat, location_lng, updated_at,
    (
      (CASE WHEN verification_status='verified' THEN 1 ELSE 0 END) * $W_ver
      + (credibility / 100.0) * $W_cred
      + COALESCE(ts_rank_cd(to_tsvector(coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')), plainto_tsquery($q)), 0) * $W_rel
      + COALESCE(1 - LEAST( distance_km / $MAX_DIST, 1.0 ), 0) * $W_prox
      + (EXTRACT(EPOCH FROM (now() - updated_at))/86400) -- compute age_days -> transform outside
    ) AS score
  FROM profiles
  WHERE mode IN ('provider','both')
    AND ($verifiedOnly::boolean IS FALSE OR verification_status='verified')
    AND ( $q IS NULL OR to_tsvector(coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')) @@ plainto_tsquery($q) )
    -- optionally filter by skill/location here
  ORDER BY score DESC
  LIMIT $pageSize OFFSET $offset;
  ```

Indexing and DB setup
- Add indexes:
  - `mode` (btree)
  - `verification_status` (btree)
  - `lower(full_name)` and `lower(primary_skill)` (btree) for case-insensitive equality
  - Use `pg_trgm` + GIN on `full_name` and `primary_skill` for fast similarity/LIKE: `CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE INDEX ON profiles USING gin (full_name gin_trgm_ops);`
  - If using location queries often, add PostGIS or store lat/lng and use a spatial index (PostGIS recommended).

Fallback behavior and UX
- If no `q` provided: score mostly by verification + credibility + proximity + recency.
- If `q` provided: textual relevance lifts results that match query terms.
- Always paginate and return total count or a `hasMore` boolean (prefer keyset pagination for large datasets).

Tuning & rollout
- Expose weights via config/env and log top N results for the first few days.
- Do offline scoring (compute score for cached sample) and small A/B test comparing current ordering vs new algorithm.
- Instrument metrics: CTR on provider cards, booking rate, and bounce rate.

Operational notes
- Avoid selecting large JSON columns (e.g., `products`) in this endpoint; fetch them in provider detail.
- Use server-side caching (e.g., 30s) for hot queries to reduce DB pressure.
- Always `EXPLAIN ANALYZE` slow queries and add indexes guided by the plan.

Example quick mitigation SQL (immediate)
```
SELECT id, user_id, profile_image, full_name, primary_skill, credibility, verification_status, location_lat, location_lng, updated_at
FROM profiles
WHERE mode IN ('provider','both')
ORDER BY created_at DESC
LIMIT 20;
```
