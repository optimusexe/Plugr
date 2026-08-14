import { execute, query } from "@/lib/azure/postgres";
import { getReviewsByProvider } from "@/lib/review-store";
import { getProfileById } from "@/lib/profile-store";
import { computeProfileSetupScore, computeVerificationScore, computeReviewPoints } from "@/lib/credibility";
import { getStoreByProviderId } from "@/lib/store-store";
import { getCachedAsync, setCachedAsync } from "@/lib/redis-cache";
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsOverview,
  AnalyticsTrendPoint,
  AnalyticsChannelBreakdown,
  AnalyticsRatingDistribution,
  AnalyticsPeakHour,
  AnalyticsInteractionsByStatus,
  InteractionStatus,
  ContactChannel,
} from "@/lib/types";

function makeId(): string {
  return `ae_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureAnalyticsEventsTable(): Promise<void> {
  await execute(`
    create table if not exists analytics_events (
      id text primary key,
      provider_id text not null,
      event_type text not null,
      metadata jsonb null,
      visitor_id text null,
      created_at timestamptz not null default now()
    )
  `);
  await execute(`create index if not exists analytics_events_provider_idx on analytics_events(provider_id, event_type, created_at desc)`);
  await execute(`create index if not exists analytics_events_created_at_idx on analytics_events(created_at desc)`);
}

export async function recordAnalyticsEvent(input: {
  providerId: string;
  eventType: AnalyticsEventType;
  metadata?: Record<string, unknown>;
  visitorId?: string;
}): Promise<AnalyticsEvent> {
  await ensureAnalyticsEventsTable();

  const event: AnalyticsEvent = {
    id: makeId(),
    providerId: input.providerId,
    eventType: input.eventType,
    metadata: input.metadata,
    visitorId: input.visitorId,
    createdAt: new Date().toISOString(),
  };

  await query(
    `insert into analytics_events (id, provider_id, event_type, metadata, visitor_id, created_at)
     values ($1, $2, $3, $4, $5, $6::timestamptz)`,
    [event.id, event.providerId, event.eventType, event.metadata ? JSON.stringify(event.metadata) : null, event.visitorId ?? null, event.createdAt],
  );

  return event;
}

export async function getProfileViews(providerId: string, since: Date): Promise<number> {
  await ensureAnalyticsEventsTable();
  const result = await query<{ count: string }>(
    `select count(*) as count from analytics_events where provider_id = $1 and event_type = 'profile_view' and created_at >= $2`,
    [providerId, since.toISOString()],
  );
  return parseInt(result.rows[0]?.count || "0", 10);
}

export async function getContactClicks(providerId: string, since: Date): Promise<number> {
  await ensureAnalyticsEventsTable();
  const result = await query<{ count: string }>(
    `select count(*) as count from analytics_events where provider_id = $1 and event_type = 'contact_click' and created_at >= $2`,
    [providerId, since.toISOString()],
  );
  return parseInt(result.rows[0]?.count || "0", 10);
}

export async function getSearchAppearances(providerId: string, since: Date): Promise<number> {
  await ensureAnalyticsEventsTable();
  const result = await query<{ count: string }>(
    `select count(*) as count from analytics_events where provider_id = $1 and event_type = 'search_appearance' and created_at >= $2`,
    [providerId, since.toISOString()],
  );
  return parseInt(result.rows[0]?.count || "0", 10);
}

export async function getViewsTrend(providerId: string, days: number): Promise<AnalyticsTrendPoint[]> {
  await ensureAnalyticsEventsTable();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await query<{ date: string; views: string; contacts: string; search_appearances: string }>(
    `select
       date_trunc('day', created_at)::date as date,
       coalesce(sum(case when event_type = 'profile_view' then 1 else 0 end), 0) as views,
       coalesce(sum(case when event_type = 'contact_click' then 1 else 0 end), 0) as contacts,
       coalesce(sum(case when event_type = 'search_appearance' then 1 else 0 end), 0) as search_appearances
     from analytics_events
     where provider_id = $1 and created_at >= $2
     group by date_trunc('day', created_at)
     order by date asc`,
    [providerId, since.toISOString()],
  );

  return result.rows.map((row) => ({
    date: new Date(row.date).toISOString().split("T")[0],
    views: parseInt(row.views, 10),
    contacts: parseInt(row.contacts, 10),
    searchAppearances: parseInt(row.search_appearances, 10),
  }));
}

export async function getChannelBreakdown(providerId: string, since: Date): Promise<AnalyticsChannelBreakdown[]> {
  const result = await query<{ contact_channel: ContactChannel; count: string }>(
    `select contact_channel, count(*) as count
     from interactions
     where provider_id = $1 and created_at >= $2
     group by contact_channel
     order by count desc`,
    [providerId, since.toISOString()],
  );

  const total = result.rows.reduce((acc, row) => acc + parseInt(row.count, 10), 0);

  return result.rows.map((row) => ({
    channel: row.contact_channel,
    count: parseInt(row.count, 10),
    percentage: total > 0 ? Math.round((parseInt(row.count, 10) / total) * 100) : 0,
  }));
}

export async function getRatingDistribution(providerId: string): Promise<AnalyticsRatingDistribution[]> {
  const result = await query<{ rating: number; count: string }>(
    `select rating, count(*) as count
     from reviews
     where provider_id = $1
     group by rating
     order by rating asc`,
    [providerId],
  );

  const total = result.rows.reduce((acc, row) => acc + parseInt(row.count, 10), 0);

  return [1, 2, 3, 4, 5].map((rating) => {
    const found = result.rows.find((r) => r.rating === rating);
    const count = found ? parseInt(found.count, 10) : 0;
    return {
      rating,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

export async function getPeakHours(providerId: string, since: Date): Promise<AnalyticsPeakHour[]> {
  const result = await query<{ hour: string; day_of_week: string; count: string }>(
    `select
       extract(hour from created_at) as hour,
       extract(dow from created_at) as day_of_week,
       count(*) as count
     from interactions
     where provider_id = $1 and created_at >= $2
     group by hour, day_of_week
     order by hour, day_of_week`,
    [providerId, since.toISOString()],
  );

  return result.rows.map((row) => ({
    hour: parseInt(row.hour, 10),
    dayOfWeek: parseInt(row.day_of_week, 10),
    count: parseInt(row.count, 10),
  }));
}

export async function getInteractionsByStatus(providerId: string): Promise<AnalyticsInteractionsByStatus[]> {
  const result = await query<{ status: InteractionStatus; count: string }>(
    `select status, count(*) as count
     from interactions
     where provider_id = $1
     group by status
     order by count desc`,
    [providerId],
  );

  return result.rows.map((row) => ({
    status: row.status,
    count: parseInt(row.count, 10),
  }));
}

export async function getAverageResponseTime(providerId: string): Promise<{ averageHours: number | null; medianHours: number | null }> {
  // Response time = time from interaction creation to provider confirmation.
  // Only counts provider_confirmed (not mutually_confirmed) to avoid
  // including consumer confirmation time in the metric.
  const result = await query<{ hours: number }>(
    `select
       avg(extract(epoch from (updated_at - created_at)) / 3600) as hours
     from interactions
     where provider_id = $1
       and status = 'provider_confirmed'
       and updated_at > created_at`,
    [providerId],
  );

  const avg = result.rows[0]?.hours;
  const averageHours = avg !== null && avg !== undefined ? Math.round(avg * 10) / 10 : null;

  const medianResult = await query<{ hours: number }>(
    `select hours from (
       select extract(epoch from (updated_at - created_at)) / 3600 as hours
       from interactions
       where provider_id = $1
         and status = 'provider_confirmed'
         and updated_at > created_at
       order by hours
     ) sub
     offset (select count(*) / 2 from interactions
       where provider_id = $1
         and status = 'provider_confirmed'
         and updated_at > created_at)
     limit 1`,
    [providerId],
  );

  const median = medianResult.rows[0]?.hours;
  const medianHours = median !== null && median !== undefined ? Math.round(median * 10) / 10 : null;

  return { averageHours, medianHours };
}

export async function getRepeatCustomerRate(providerId: string): Promise<number> {
  const result = await query<{ total: string; repeat: string }>(
    `select
       count(*) as total,
       count(*) filter (where cnt > 1) as repeat
     from (
       select consumer_id, count(*) as cnt
       from interactions
       where provider_id = $1
       group by consumer_id
     ) sub`,
    [providerId],
  );

  const total = parseInt(result.rows[0]?.total || "0", 10);
  const repeat = parseInt(result.rows[0]?.repeat || "0", 10);
  return total > 0 ? Math.round((repeat / total) * 100) : 0;
}

export async function getAnalyticsOverview(providerId: string, periodDays: number = 30): Promise<AnalyticsOverview> {
  const cacheKey = `analytics:overview:${providerId}:${periodDays}`;
  const cached = await getCachedAsync<AnalyticsOverview>(cacheKey);
  if (cached) return cached;

  const since = new Date();
  since.setDate(since.getDate() - periodDays);
  const priorSince = new Date();
  priorSince.setDate(priorSince.getDate() - periodDays * 2);

  const [
    profileViews,
    contactClicks,
    searchAppearances,
    priorProfileViews,
    priorContactClicks,
    priorSearchAppearances,
    ratingDistribution,
    responseTime,
    repeatCustomerRate,
    profile,
    reviews,
    store,
  ] = await Promise.all([
    getProfileViews(providerId, since),
    getContactClicks(providerId, since),
    getSearchAppearances(providerId, since),
    getProfileViews(providerId, priorSince),
    getContactClicks(providerId, priorSince),
    getSearchAppearances(providerId, priorSince),
    getRatingDistribution(providerId),
    getAverageResponseTime(providerId),
    getRepeatCustomerRate(providerId),
    getProfileById(providerId),
    getReviewsByProvider(providerId),
    getStoreByProviderId(providerId).catch(() => null),
  ]);

  function calcTrend(current: number, prior: number): number {
    if (prior === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prior) / prior) * 100);
  }

  const totalReviews = ratingDistribution.reduce((acc, r) => acc + r.count, 0);
  const weightedRating = ratingDistribution.reduce((acc, r) => acc + r.rating * r.count, 0);
  const averageRating = totalReviews > 0 ? Math.round((weightedRating / totalReviews) * 10) / 10 : null;

  const priorWeightedRating = ratingDistribution.reduce((acc, r) => acc + r.rating * r.count, 0);
  const priorAverageRating = totalReviews > 0 ? Math.round((priorWeightedRating / totalReviews) * 10) / 10 : null;

  const conversionRate = profileViews > 0 ? Math.round((contactClicks / profileViews) * 100) : 0;
  const priorConversionRate = priorProfileViews > 0 ? Math.round((priorContactClicks / priorProfileViews) * 100) : 0;

  const overview: AnalyticsOverview = {
    profileViews: {
      total: profileViews,
      trend: calcTrend(profileViews, priorProfileViews),
    },
    contactClicks: {
      total: contactClicks,
      trend: calcTrend(contactClicks, priorContactClicks),
    },
    searchAppearances: {
      total: searchAppearances,
      trend: calcTrend(searchAppearances, priorSearchAppearances),
    },
    conversionRate: {
      value: conversionRate,
      trend: calcTrend(conversionRate, priorConversionRate),
    },
    averageRating: {
      value: averageRating,
      trend: calcTrend(averageRating ?? 0, priorAverageRating ?? 0),
    },
    totalReviews,
      credibilityScore: {
      total: profile?.credibility ?? 0,
      profileSetup: computeProfileSetupScore(profile, Boolean(store)),
      verification: computeVerificationScore(profile),
      reviews: computeReviewPoints(reviews),
    },
    responseTime,
    repeatCustomerRate,
  };

  await setCachedAsync(cacheKey, overview, 60000);
  return overview;
}
