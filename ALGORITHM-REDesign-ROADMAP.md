# Provider Discovery Algorithm — Redesign Roadmap

## Current State

### What Exists Today

The Discover page uses two different ranking strategies depending on whether the user searches:

**Search Mode** (user types a query):
- Composite score combining verification, credibility, relevance, and recency
- PostgreSQL full-text search with `ts_rank_cd`
- Exponential decay on `updated_at` for recency
- Works as intended

**Default Mode** (no query, browsing):
- Simple column sort: `verification_status DESC, credibility DESC, updated_at DESC`
- No composite score
- No engagement signals
- No diversity rules

### The Problem

The default feed is what users see first when they open Discover. It uses a naive sort that doesn't combine signals:

- A verified provider with 0 credibility always beats an unverified provider with 90 credibility
- No consideration of popularity, engagement, or activity
- No diversity — can show 10 graphic designers in a row
- Inconsistent experience between search and browse modes

Platforms like X, LinkedIn, and Instagram use composite scoring that considers multiple signals simultaneously. Our default feed should do the same.

---

## Proposed Algorithm Design

### Core Principle

Every provider gets a **composite score** (0-100 scale) that combines multiple signals into a single number. Higher scores appear first. This applies to both search and default modes.

### Signal Breakdown

#### 1. Verification Score (Trust)
- **What**: Has an admin verified this provider?
- **Values**: 0 or 1 (binary)
- **Weight**: 2.0 (configurable)
- **Why**: Verified providers are trusted by the platform

#### 2. Credibility Score (Quality)
- **What**: How complete and reputable is this provider?
- **Values**: 0-1 (normalized from 0-100)
- **Weight**: 1.5 (configurable)
- **Why**: Higher credibility = better service quality

#### 3. Recency Score (Freshness)
- **What**: How recently was this provider active?
- **Values**: 0-1 (exponential decay)
- **Weight**: 1.0 (configurable)
- **Why**: Active providers are more likely to respond

#### 4. Engagement Score (Popularity)
- **What**: How much attention does this provider get?
- **Values**: 0-1 (normalized composite)
- **Weight**: 0.8 (configurable)
- **Why**: Popular providers are likely in demand

#### 5. Freshness Score (Profile Updates)
- **What**: How recently did they update their profile?
- **Values**: 0-1 (exponential decay)
- **Weight**: 0.6 (configurable)
- **Why**: Updated profiles show they're maintaining their presence

### Score Formula

```
score = 
    w_verify * verification_score
  + w_cred * credibility_score
  + w_recency * recency_score
  + w_engagement * engagement_score
  + w_freshness * freshness_score
```

**Maximum possible score**: 2.0 + 1.5 + 1.0 + 0.8 + 0.6 = 5.9

### Signal Calculations

#### verification_score
```sql
CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END
```

#### credibility_score
```sql
COALESCE(credibility, 0) / 100.0
```

#### recency_score
```sql
EXP(-EXTRACT(EPOCH FROM (now() - last_active_at)) / 86400.0 / 30.0)
```
- 0 days ago = 1.0
- 30 days ago = 0.37
- 90 days ago = 0.05

#### engagement_score
```sql
(
  LEAST(view_count / 100.0, 1.0) * 0.3 +
  LEAST(contact_count / 20.0, 1.0) * 0.4 +
  LEAST(review_count / 10.0, 1.0) * 0.3
)
```
- Normalizes each component to 0-1
- Caps at 1.0 to prevent outliers from dominating
- Weights: views 30%, contacts 40%, reviews 30%

#### freshness_score
```sql
EXP(-EXTRACT(EPOCH FROM (now() - updated_at)) / 86400.0 / 60.0)
```
- Slower decay than recency (60-day half-life)
- 0 days ago = 1.0
- 60 days ago = 0.37
- 180 days ago = 0.05

---

## Implementation Roadmap

### Phase 1: Database Schema Changes

**Goal**: Add columns needed for new signals

**New Columns on `profiles` table**:
| Column | Type | Purpose |
|--------|------|---------|
| `last_active_at` | timestamptz | Last login or interaction |
| `view_count` | integer | Total profile views |
| `contact_count` | integer | Total contact clicks |

**Migration Steps**:
1. Add `last_active_at` column (default: `updated_at`)
2. Add `view_count` column (default: 0)
3. Add `contact_count` column (default: 0)
4. Backfill `last_active_at` from `updated_at`
5. Backfill counts from existing analytics_events and interactions

**Files to Modify**:
- `scripts/run-migrations.js` — Add new columns
- `src/lib/profile-store.ts` — Update table creation and row mapping

---

### Phase 2: Event Tracking Updates

**Goal**: Increment counters when events happen

**Update Profile View Tracking**:
- `src/app/discover/provider/[id]/page.tsx` — Increment `view_count` on profile view

**Update Contact Click Tracking**:
- `src/components/providers/provider-contact-actions.tsx` — Increment `contact_count` on contact click

**Update Activity Tracking**:
- `src/app/api/auth/login/route.ts` — Update `last_active_at` on login
- `src/app/api/interactions/[id]/confirm/route.ts` — Update `last_active_at` on interaction confirm

**Files to Modify**:
- `src/lib/profile-store.ts` — Add increment functions
- `src/app/discover/provider/[id]/page.tsx` — Call increment
- `src/components/providers/provider-contact-actions.tsx` — Call increment
- `src/app/api/auth/login/route.ts` — Update last_active_at
- `src/app/api/interactions/[id]/confirm/route.ts` — Update last_active_at

---

### Phase 3: Scoring Configuration

**Goal**: Add weight parameters for new signals

**New Environment Variables**:
| Variable | Default | Purpose |
|----------|---------|---------|
| `RANK_WEIGHT_ENGAGEMENT` | 0.8 | Engagement signal weight |
| `RANK_WEIGHT_FRESHNESS` | 0.6 | Freshness signal weight |
| `RANK_RECENCY_DAYS` | 30 | Recency decay rate (already exists) |

**Files to Modify**:
- `src/lib/azure/config.ts` — Add new config functions

---

### Phase 4: Update Scoring Logic

**Goal**: Apply composite score in both search and default modes

**Update `findProvidersDefault`**:
- Compute composite score instead of column sort
- Use same scoring formula as search mode
- Maintain keyset pagination

**Update `findProvidersSearch`**:
- Add engagement and freshness to score
- Add weight for recency (currently raw)

**Files to Modify**:
- `src/lib/profile-store.ts` — Update both functions

---

### Phase 5: Diversity Layer

**Goal**: Avoid showing same skill repeatedly

**Approach**:
- Post-query diversification in application layer
- Group results by `primary_skill`
- Round-robin from each skill group
- Ensure no more than 2 consecutive same-skill providers

**Files to Modify**:
- `src/lib/profile-store.ts` — Add diversify function
- `src/app/api/discover/providers/route.ts` — Apply diversity after scoring

---

### Phase 6: Testing and Tuning

**Goal**: Validate algorithm works as intended

**Testing Checklist**:
- [ ] Default mode shows composite-scored results
- [ ] Search mode includes engagement and freshness
- [ ] Verified providers don't always beat high-credibility unverified
- [ ] Diversity prevents skill clustering
- [ ] Keyset pagination works with new scoring
- [ ] Performance is acceptable (<200ms for 20 results)

**Tuning Steps**:
1. Log top 20 results for first week
2. Compare click-through rates old vs new
3. Adjust weights based on data
4. A/B test if possible

---

## Success Metrics

### Primary Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Provider profile CTR | Unknown | +20% |
| Contact rate from Discover | Unknown | +15% |
| Time to first contact | Unknown | -25% |

### Secondary Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Search vs browse ratio | Unknown | More browse |
| Skill diversity in top 20 | Low | High |
| Verified vs unverified CTR | Unknown | Balanced |

---

## Technical Details

### SQL Query Structure (Default Mode)

```sql
WITH scored AS (
  SELECT 
    *,
    (
      (CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) * 2.0
      + (COALESCE(credibility, 0) / 100.0) * 1.5
      + EXP(-EXTRACT(EPOCH FROM (now() - last_active_at)) / 86400.0 / 30.0) * 1.0
      + (
          LEAST(view_count / 100.0, 1.0) * 0.3 +
          LEAST(contact_count / 20.0, 1.0) * 0.4 +
          LEAST(review_count / 10.0, 1.0) * 0.3
        ) * 0.8
      + EXP(-EXTRACT(EPOCH FROM (now() - updated_at)) / 86400.0 / 60.0) * 0.6
    ) AS score
  FROM profiles
  WHERE mode IN ('provider', 'both')
)
SELECT * FROM scored
ORDER BY score DESC, updated_at DESC, id DESC
LIMIT 20;
```

### Performance Considerations

1. **Indexes needed**:
   - `last_active_at` (btree)
   - Composite on `(score, updated_at, id)` for keyset pagination

2. **Caching**:
   - Cache scored results for 30 seconds
   - Invalidate on profile update or interaction

3. **Backfill**:
   - Run backfill script after migration
   - Set `last_active_at = updated_at` for all existing profiles
   - Set counts from analytics_events and interactions tables

---

## Future Enhancements

### Personalized Feed (Phase 7+)
- Track user search history
- Boost providers matching past searches
- Collaborative filtering: "users like you contacted..."

### Location-Aware (Phase 8+)
- Add lat/lng to profiles
- Boost nearby providers
- Walking distance for campus services

### Real-Time Ranking (Phase 9+)
- WebSocket updates for live activity
- Boost providers currently online
- Show "active now" badges

---

## Rollback Plan

If the new algorithm performs poorly:

1. Revert to column sorting by setting weights to 0:
   ```
   RANK_WEIGHT_ENGAGEMENT=0
   RANK_WEIGHT_FRESHNESS=0
   ```

2. Or revert code changes to previous version

3. Keep database columns (no harm in having them)

---

## Timeline Estimate

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Schema changes | 1-2 hours | High |
| Phase 2: Event tracking | 2-3 hours | High |
| Phase 3: Config | 30 min | High |
| Phase 4: Scoring logic | 3-4 hours | High |
| Phase 5: Diversity | 2-3 hours | Medium |
| Phase 6: Testing | 2-3 hours | High |

**Total**: 11-16 hours for MVP

---

## References

- Current algorithm: `discover-page-algorithm.md`
- Profile store: `src/lib/profile-store.ts`
- Config: `src/lib/azure/config.ts`
- Analytics store: `src/lib/analytics-store.ts`
