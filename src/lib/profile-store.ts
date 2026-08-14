import { execute, query } from "@/lib/azure/postgres";
import { getRankingWeightVerified, getRankingWeightCredibility, getRankingWeightRelevance, getRankingRecencyDays, getRankingWeightEngagement, getRankingWeightFreshness } from "@/lib/azure/config";
import { runMigrationsAtStartup } from "@/lib/azure/config";
import type { ProfileMode, ProfileProduct, RegisterPayload, StudentProfile, VerificationStatus } from "@/lib/types";

type Metrics = {
  totalStudents: number;
  providerCount: number;
  verifiedProviderRate: number;
  activeCategories: number;
};

let profilesTableReady: Promise<void> | null = null;
let rankingColumnsEnsured: boolean | null = null;

async function hasRankingColumns(): Promise<boolean> {
  if (rankingColumnsEnsured !== null) return rankingColumnsEnsured;
  try {
    const result = await query<{ column_name: string }>(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active_at' LIMIT 1`
    );
    rankingColumnsEnsured = result.rows.length > 0;
  } catch {
    rankingColumnsEnsured = false;
  }
  return rankingColumnsEnsured;
}

function makeId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeProducts(products?: ProfileProduct[]): ProfileProduct[] | undefined {
  if (!products || products.length === 0) {
    return undefined;
  }

  const normalized = products
    .map((product) => ({
      id: product.id,
      name: normalizeText(product.name),
      price: product.price ? product.price.trim() : undefined,
      description: product.description ? product.description.trim() : undefined,
      image: product.image ? product.image.trim() : undefined,
    }))
    .filter((product) => product.id && product.name);

  return normalized.length > 0 ? normalized : undefined;
}

type ProfileRow = {
  id: string;
  user_id: string;
  profile_image: string | null;
  products: unknown | null;
  full_name: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  email: string | null;
  location_text: string;
  map_link: string | null;
  primary_skill: string | null;
  bio: string | null;
  mode: ProfileMode;
  verification_status: "pending" | "verified";
  credibility: number;
  last_active_at: string | Date | null;
  view_count: number;
  contact_count: number;
  created_at: string | Date;
  updated_at: string | Date;
};

function parseProducts(value: unknown): ProfileProduct[] | undefined {
  if (!value) {
    return undefined;
  }

  const raw = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(raw)) {
    return undefined;
  }

  const normalized = raw
    .map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? "").trim(),
      price: item.price ? String(item.price).trim() : undefined,
      description: item.description ? String(item.description).trim() : undefined,
      image: item.image ? String(item.image).trim() : undefined,
    }))
    .filter((product) => product.id && product.name);

  return normalized.length > 0 ? normalized : undefined;
}

function mapProfileRow(row: ProfileRow): StudentProfile {
  return {
    id: row.id,
    userId: row.user_id,
    profileImage: row.profile_image ?? undefined,
    products: parseProducts(row.products),
    fullName: row.full_name,
    faculty: row.faculty,
    department: row.department,
    level: row.level,
    phone: row.phone,
    email: row.email ?? undefined,
    locationText: row.location_text,
    mapLink: row.map_link ?? undefined,
    primarySkill: row.primary_skill ?? undefined,
    bio: row.bio ?? undefined,
    mode: row.mode,
    verificationStatus: row.verification_status,
    credibility: typeof row.credibility === "number" ? row.credibility : Number(row.credibility) || 0,
    lastActiveAt: row.last_active_at ? new Date(row.last_active_at).toISOString() : undefined,
    viewCount: typeof row.view_count === "number" ? row.view_count : Number(row.view_count) || 0,
    contactCount: typeof row.contact_count === "number" ? row.contact_count : Number(row.contact_count) || 0,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function ensureProfilesTable(): Promise<void> {
  if (!profilesTableReady) {
    profilesTableReady = (async () => {
      // If migrations are managed externally, skip CREATE TABLE/INDEX but still add new columns.
      if (runMigrationsAtStartup()) {
        await execute(`
          create table if not exists profiles (
            id text primary key,
            user_id text not null unique,
            profile_image text null,
            products jsonb null,
            full_name text not null,
            faculty text not null,
            department text not null,
            level text not null,
            phone text not null,
            email text null,
            location_text text not null,
            map_link text null,
            primary_skill text null,
            bio text null,
            mode text not null,
            verification_status text not null default 'pending',
            credibility numeric not null default 0,
            last_active_at timestamptz null,
            view_count integer not null default 0,
            contact_count integer not null default 0,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          );
        `);

        try {
          await execute(`create index if not exists profiles_mode_idx on profiles(mode)`);
          await execute(`create index if not exists profiles_verification_idx on profiles(verification_status)`);
          await execute(`create index if not exists profiles_updated_at_idx on profiles(updated_at desc)`);
          await execute(`create index if not exists profiles_discover_default_idx on profiles(verification_status desc, credibility desc, updated_at desc, id desc) where mode in ('provider','both')`);
          await execute(`create index if not exists profiles_last_active_at_idx on profiles(last_active_at desc)`);
          try {
            await execute(`create index if not exists profiles_fullname_trgm on profiles using gin (full_name gin_trgm_ops)`);
            await execute(`create index if not exists profiles_primaryskill_trgm on profiles using gin (primary_skill gin_trgm_ops)`);
            await execute(`create index if not exists profiles_search_tsv on profiles using gin (to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')))`);
          } catch (innerErr: any) {
            const msg = String(innerErr?.message || innerErr);
            if (/pg_trgm|extension .* not allow-listed|0A000/i.test(msg)) {
              console.warn("pg_trgm not available or not permitted; skipping trigram indexes");
            } else {
              throw innerErr;
            }
          }
        } catch (err) {
          try {
            console.warn("profiles index creation warning:", err);
          } catch {}
        }
      }
    })().catch((error) => {
      profilesTableReady = null;
      throw error;
    });
  }

  await profilesTableReady;
}

async function readProfilesFromDb(limit = 20, offset = 0): Promise<StudentProfile[]> {
  await ensureProfilesTable();

  // Fetch a narrow set of columns ordered by recent updates to avoid full-table scans.
  // Avoid selecting large JSON columns (products) unless needed.
  const result = await query<ProfileRow>(
    `select
       id, user_id, profile_image, full_name, faculty, department, level,
       phone, email, location_text, map_link, primary_skill, bio,
       mode, verification_status, credibility, last_active_at,
       view_count, contact_count, created_at, updated_at
     from profiles
     order by updated_at desc
     limit $1 offset $2`,
    [limit, offset],
  );

  return result.rows.map(mapProfileRow);
}

async function findProfileRowByUserId(userId: string): Promise<StudentProfile | null> {
  await ensureProfilesTable();
  const result = await query<ProfileRow>(`select * from profiles where user_id = $1 limit 1`, [userId]);
  return result.rows[0] ? mapProfileRow(result.rows[0]) : null;
}

async function findProfileRowById(id: string): Promise<StudentProfile | null> {
  await ensureProfilesTable();
  const result = await query<ProfileRow>(`select * from profiles where id = $1 limit 1`, [id]);
  return result.rows[0] ? mapProfileRow(result.rows[0]) : null;
}

async function upsertProfileIntoDb(profile: StudentProfile): Promise<StudentProfile> {
  await ensureProfilesTable();
  const result = await query<ProfileRow>(
    `insert into profiles (
      id, user_id, profile_image, products, full_name, faculty, department, level, phone, email,
      location_text, map_link, primary_skill, bio, mode, verification_status, credibility,
      last_active_at, view_count, contact_count, created_at, updated_at
    ) values (
      $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
      $18::timestamptz, $19, $20, $21::timestamptz, $22::timestamptz
    ) on conflict (user_id) do update set
      profile_image = excluded.profile_image,
      products = excluded.products,
      full_name = excluded.full_name,
      faculty = excluded.faculty,
      department = excluded.department,
      level = excluded.level,
      phone = excluded.phone,
      email = excluded.email,
      location_text = excluded.location_text,
      map_link = excluded.map_link,
      primary_skill = excluded.primary_skill,
      bio = excluded.bio,
      mode = excluded.mode,
      verification_status = excluded.verification_status,
      credibility = excluded.credibility,
      last_active_at = excluded.last_active_at,
      view_count = excluded.view_count,
      contact_count = excluded.contact_count,
      updated_at = excluded.updated_at
    returning *`,
    [
      profile.id,
      profile.userId,
      profile.profileImage ?? null,
      JSON.stringify(profile.products ?? null),
      profile.fullName,
      profile.faculty,
      profile.department,
      profile.level,
      profile.phone,
      profile.email ?? null,
      profile.locationText,
      profile.mapLink ?? null,
      profile.primarySkill ?? null,
      profile.bio ?? null,
      profile.mode,
      profile.verificationStatus,
      profile.credibility,
      profile.lastActiveAt ?? new Date().toISOString(),
      profile.viewCount,
      profile.contactCount,
      profile.createdAt,
      profile.updatedAt,
    ],
  );

  return mapProfileRow(result.rows[0]);
}

export async function getProfiles(limit = 20, offset = 0): Promise<StudentProfile[]> {
  return readProfilesFromDb(limit, offset);
}

export async function registerProfile(payload: RegisterPayload): Promise<StudentProfile> {
  const now = new Date().toISOString();

  const profile: StudentProfile = {
    id: makeId(),
    userId: payload.userId,
    profileImage: payload.profileImage ? payload.profileImage.trim() : undefined,
    products: normalizeProducts(payload.products),
    fullName: normalizeText(payload.fullName),
    faculty: normalizeText(payload.faculty),
    department: normalizeText(payload.department),
    level: normalizeText(payload.level),
    phone: normalizeText(payload.phone),
    email: payload.email ? normalizeText(payload.email) : undefined,
    locationText: normalizeText(payload.locationText),
    primarySkill: payload.primarySkill ? normalizeText(payload.primarySkill) : undefined,
    bio: payload.bio ? normalizeText(payload.bio) : undefined,
    mode: payload.mode,
    verificationStatus: "pending",
    credibility: 0,
    lastActiveAt: now,
    viewCount: 0,
    contactCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await upsertProfileIntoDb(profile);

  return profile;
}

export async function getProfileByUserId(userId: string): Promise<StudentProfile | null> {
  return findProfileRowByUserId(userId);
}

export async function getProfileById(id: string): Promise<StudentProfile | null> {
  return findProfileRowById(id);
}

export async function getProfilesByVerificationStatus(
  verificationStatus: "pending" | "verified",
  limit = 20,
  offset = 0,
): Promise<StudentProfile[]> {
  await ensureProfilesTable();

  const result = await query<ProfileRow>(
    `select * from profiles where verification_status = $1 order by updated_at desc limit $2 offset $3`,
    [verificationStatus, limit, offset],
  );

  return result.rows.map(mapProfileRow);
}

export async function countProfilesByVerificationStatus(verificationStatus: "pending" | "verified"): Promise<number> {
  await ensureProfilesTable();
  const result = await query<{ count: string }>(`select count(*) from profiles where verification_status = $1`, [verificationStatus]);
  return Number(result.rows[0]?.count ?? 0);
}

export async function updateProfileCredibility(profileId: string, credibility: number): Promise<StudentProfile | null> {
  const profile = await getProfileById(profileId);
  if (!profile) {
    return null;
  }

  const normalized = Math.max(0, Math.min(100, Math.round(credibility * 10) / 10));
  const updated: StudentProfile = {
    ...profile,
    credibility: normalized,
    updatedAt: new Date().toISOString(),
  };

  return upsertProfileIntoDb(updated);
}

export async function setProfileVerificationStatus(
  userId: string,
  verificationStatus: VerificationStatus,
): Promise<StudentProfile | null> {
  const profile = await getProfileByUserId(userId);

  if (!profile) {
    return null;
  }

  const updated: StudentProfile = {
    ...profile,
    verificationStatus,
    updatedAt: new Date().toISOString(),
  };

  return upsertProfileIntoDb(updated);
}

export async function upsertProfile(payload: RegisterPayload): Promise<StudentProfile> {
  const now = new Date().toISOString();

  const existing = await getProfileByUserId(payload.userId);

  if (!existing) {
    const created = await registerProfile(payload);
    return created;
  }

  const updated: StudentProfile = {
    ...existing,
    profileImage: payload.profileImage ? payload.profileImage.trim() : undefined,
    products: payload.products ? normalizeProducts(payload.products) : existing.products,
    fullName: normalizeText(payload.fullName),
    faculty: normalizeText(payload.faculty),
    department: normalizeText(payload.department),
    level: normalizeText(payload.level),
    phone: normalizeText(payload.phone),
    email: payload.email ? normalizeText(payload.email) : undefined,
    locationText: normalizeText(payload.locationText),
    primarySkill: payload.primarySkill ? normalizeText(payload.primarySkill) : undefined,
    bio: payload.bio ? normalizeText(payload.bio) : undefined,
    mode: payload.mode,
    // If a verified profile changes key identity fields (name or profile image),
    // send the badge back under review to preserve trust.
    verificationStatus: (() => {
      const newName = normalizeText(payload.fullName);
      const newProfileImage = payload.profileImage ? payload.profileImage.trim() : undefined;
      const nameChanged = newName !== existing.fullName;
      const imageChanged = newProfileImage !== existing.profileImage;
      return existing.verificationStatus === "verified" && (nameChanged || imageChanged) ? "pending" : existing.verificationStatus;
    })(),
    updatedAt: now,
  };

  return upsertProfileIntoDb(updated);
}

export async function switchProfileMode(id: string, mode: ProfileMode): Promise<StudentProfile | null> {
  const profile = await getProfileById(id);

  if (!profile) {
    return null;
  }

  const updated: StudentProfile = {
    ...profile,
    mode,
    updatedAt: new Date().toISOString(),
  };

  return upsertProfileIntoDb(updated);
}

export type ProvidersPage = { providers: StudentProfile[]; nextCursor?: string };

type DiscoverDefaultCursor = {
  kind: "default";
  score: number;
  updatedAt: string;
  id: string;
};

type DiscoverSearchCursor = {
  kind: "search";
  score: number;
  updatedAt: string;
  id: string;
};

type DiscoverCursor = DiscoverDefaultCursor | DiscoverSearchCursor;

export async function findProviders(
  search: string,
  verifiedOnly: boolean,
  limit = 20,
  cursor?: DiscoverCursor | null,
): Promise<ProvidersPage> {
  await ensureProfilesTable();

  const q = search ? search.trim() : "";
  const hasQuery = q.length > 0;

  const page = !hasQuery
    ? await findProvidersDefault(verifiedOnly, limit, cursor?.kind === "default" ? cursor : undefined)
    : await findProvidersSearch(q, verifiedOnly, limit, cursor?.kind === "search" ? cursor : undefined);

  if (page.providers.length > 0) {
    const enriched = await enrichProvidersWithStore(page.providers);
    page.providers = enriched;
  }

  return page;
}

async function enrichProvidersWithStore(providers: StudentProfile[]): Promise<StudentProfile[]> {
  const ids = providers.map((p) => p.id);
  try {
    const result = await query<{ provider_id: string; slug: string; name: string }>(
      `select provider_id, slug, name from stores where provider_id = any($1)`,
      [ids],
    );
    const byProvider = new Map(result.rows.map((row) => [row.provider_id, row]));
    return providers.map((provider) => {
      const store = byProvider.get(provider.id);
      return store
        ? { ...provider, storeSlug: store.slug, storeName: store.name }
        : provider;
    });
  } catch {
    return providers;
  }
}

async function findProvidersDefault(
  verifiedOnly: boolean,
  limit: number,
  cursor?: DiscoverDefaultCursor,
): Promise<ProvidersPage> {
  await ensureProfilesTable();

  const columnsExist = await hasRankingColumns();
  if (columnsExist) {
    try {
      return await findProvidersDefaultScored(verifiedOnly, limit, cursor);
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (/does not exist/i.test(msg)) {
        rankingColumnsEnsured = false;
      } else {
        console.warn("findProvidersDefault: scored query failed, using fallback:", msg);
      }
    }
  }

  // Fallback: simple column sort (works even if new columns don't exist)
  const whereParts: string[] = ["mode in ('provider','both')"];
  const params: unknown[] = [];

  if (verifiedOnly) {
    whereParts.push("verification_status = 'verified'");
  }

  let cursorClause = "";
  if (cursor) {
    params.push(cursor.score, cursor.updatedAt, cursor.id);
    const scoreIdx = params.length - 2;
    const updatedIdx = params.length - 1;
    const idIdx = params.length;
    cursorClause = `AND (
      credibility < $${scoreIdx}
      OR (credibility = $${scoreIdx} AND (updated_at < $${updatedIdx} OR (updated_at = $${updatedIdx} AND id < $${idIdx})))
    )`;
  }

  const fetchLimit = Math.min(limit * 3, 60);
  params.push(fetchLimit);
  const limitParamIndex = params.length;

  const finalSql = `
    SELECT id, user_id, profile_image, products, full_name, faculty, department, level, phone, email,
           location_text, map_link, primary_skill, bio, mode, verification_status, credibility,
           created_at, updated_at
    FROM profiles
    WHERE ${whereParts.join(" AND ")}
    ${cursorClause}
    ORDER BY verification_status DESC, credibility DESC, updated_at DESC, id DESC
    LIMIT $${limitParamIndex}
  `;

  const rows = await query<any>(finalSql, params);
  const allMapped = rows.rows.map(mapProfileRow);

  let nextCursor: string | undefined = undefined;
  if (rows.rows.length >= limit) {
    const lastRaw = rows.rows[rows.rows.length - 1];
    try {
      nextCursor = Buffer.from(
        JSON.stringify({
          kind: "default",
          score: Number(lastRaw.credibility ?? 0),
          updatedAt: new Date(lastRaw.updated_at).toISOString(),
          id: lastRaw.id,
        }),
      ).toString("base64");
    } catch {}
  }

  const diversified = diversifyBySkill(allMapped, limit);

  return { providers: diversified, nextCursor };
}

async function findProvidersDefaultScored(
  verifiedOnly: boolean,
  limit: number,
  cursor?: DiscoverDefaultCursor,
): Promise<ProvidersPage> {
  const RECENCY_T = getRankingRecencyDays();
  const FRESHNESS_T = 60;

  const whereParts: string[] = ["mode in ('provider','both')"];
  const params: unknown[] = [];

  if (verifiedOnly) {
    whereParts.push("verification_status = 'verified'");
  }

  let cursorClause = "";
  if (cursor) {
    params.push(cursor.score, cursor.updatedAt, cursor.id);
    const scoreIdx = params.length - 2;
    const updatedIdx = params.length - 1;
    const idIdx = params.length;
    cursorClause = `AND (
      score < $${scoreIdx}
      OR (score = $${scoreIdx} AND (updated_at < $${updatedIdx} OR (updated_at = $${updatedIdx} AND id < $${idIdx})))
    )`;
  }

  // Fetch extra rows to give the diversity layer enough material
  const fetchLimit = Math.min(limit * 3, 60);
  params.push(fetchLimit);
  const limitParamIndex = params.length;

  const scoredCte = `WITH scored AS (
    SELECT id, user_id, profile_image, products, full_name, faculty, department,
           level, phone, email, location_text, map_link, primary_skill, bio,
           mode, verification_status, credibility, last_active_at, view_count,
           contact_count, created_at, updated_at,
           (
             (case when verification_status = 'verified' then 1 else 0 end) * ${getRankingWeightVerified()}
             + (coalesce(credibility, 0) / 100.0) * ${getRankingWeightCredibility()}
             + exp(-(extract(epoch from (now() - coalesce(last_active_at, updated_at))) / 86400.0) / ${RECENCY_T})
             + (
                 least(coalesce(view_count, 0) / 100.0, 1.0) * 0.5
                 + least(coalesce(contact_count, 0) / 20.0, 1.0) * 0.5
               ) * ${getRankingWeightEngagement()}
             + exp(-(extract(epoch from (now() - updated_at)) / 86400.0) / ${FRESHNESS_T}) * ${getRankingWeightFreshness()}
           ) AS score
    FROM profiles
    WHERE ${whereParts.join(" AND ")}
  )`;

  const finalSql = `${scoredCte}
    SELECT * FROM scored
    ${cursorClause}
    ORDER BY score DESC, updated_at DESC, id DESC
    LIMIT $${limitParamIndex}
  `;

  const rows = await query<any>(finalSql, params);
  const allMapped = rows.rows.map(mapProfileRow);

  // Build cursor from the raw scored order (before diversity) for correct pagination
  let nextCursor: string | undefined = undefined;
  if (rows.rows.length >= limit) {
    const lastRaw = rows.rows[rows.rows.length - 1];
    try {
      nextCursor = Buffer.from(
        JSON.stringify({
          kind: "default",
          score: Number(lastRaw.score),
          updatedAt: new Date(lastRaw.updated_at).toISOString(),
          id: lastRaw.id,
        }),
      ).toString("base64");
    } catch {}
  }

  // Apply diversity: interleave skills so no more than 2 of the same in a row
  const diversified = diversifyBySkill(allMapped, limit);

  return { providers: diversified, nextCursor };
}

function diversifyBySkill(rows: StudentProfile[], limit: number): StudentProfile[] {
  if (rows.length <= 2) return rows.slice(0, limit);

  const queues = new Map<string, StudentProfile[]>();
  for (const row of rows) {
    const skill = (row.primarySkill ?? "other").trim().toLowerCase();
    const q = queues.get(skill);
    if (q) {
      q.push(row);
    } else {
      queues.set(skill, [row]);
    }
  }

  const skillKeys = Array.from(queues.keys());
  if (skillKeys.length <= 1) return rows.slice(0, limit);

  const result: StudentProfile[] = [];
  let round = 0;

  while (result.length < limit) {
    let added = false;
    for (const key of skillKeys) {
      const q = queues.get(key)!;
      const item = q[round];
      if (!item) continue;

      const lastSkill = result.length > 0
        ? (result[result.length - 1].primarySkill ?? "other").trim().toLowerCase()
        : "";
      if (key === lastSkill && result.length >= 2) {
        const prevSkill = result.length >= 2
          ? (result[result.length - 2].primarySkill ?? "other").trim().toLowerCase()
          : "";
        if (key === prevSkill) continue;
      }

      result.push(item);
      added = true;
      if (result.length >= limit) break;
    }
    if (!added) break;
    round++;
  }

  if (result.length < limit) {
    const seen = new Set(result.map((r) => r.id));
    for (const row of rows) {
      if (result.length >= limit) break;
      if (!seen.has(row.id)) {
        result.push(row);
        seen.add(row.id);
      }
    }
  }

  return result;
}

async function findProvidersSearch(
  q: string,
  verifiedOnly: boolean,
  limit: number,
  cursor?: DiscoverSearchCursor,
): Promise<ProvidersPage> {
  const RECENCY_T = getRankingRecencyDays(); // days

  const whereParts: string[] = ["mode in ('provider','both')"];
  const params: unknown[] = [];
  whereParts.push(`to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')) @@ plainto_tsquery($1)`);
  params.push(q);
  if (verifiedOnly) whereParts.push("verification_status = 'verified'");

  const scoreParts = [
    `(case when verification_status='verified' then 1 else 0 end) * ${getRankingWeightVerified()}`,
    `(coalesce(credibility,0)/100.0) * ${getRankingWeightCredibility()}`,
    `exp(-(extract(epoch from (now() - updated_at))/86400.0) / ${RECENCY_T})`,
  ];

  scoreParts.splice(
    2,
    0,
    `coalesce(ts_rank_cd(to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')), plainto_tsquery($1)),0) * ${getRankingWeightRelevance()}`,
  );

  const scoredCte = `WITH scored AS (
    SELECT id, user_id, profile_image, products, full_name, faculty, department, level, phone, email, location_text, map_link, primary_skill, bio, mode, verification_status, credibility, created_at, updated_at, (${scoreParts.join(" + ")}) AS score
    FROM profiles
    WHERE ${whereParts.join(' AND ')}
  )`;

  let cursorClause = "";
  if (cursor) {
    params.push(cursor.score, cursor.updatedAt, cursor.id);
    const scoreParamIndex = params.length - 2;
    const updatedParamIndex = params.length - 1;
    const idParamIndex = params.length;
    cursorClause = `WHERE (score < $${scoreParamIndex} OR (score = $${scoreParamIndex} AND (updated_at < $${updatedParamIndex} OR (updated_at = $${updatedParamIndex} AND id < $${idParamIndex}))))`;
  }

  // final select
  // limit param at the end
  params.push(limit);
  const limitParamIndex = params.length;

  const finalSql = `${scoredCte}
    SELECT id, user_id, profile_image, products, full_name, faculty, department, level, phone, email, location_text, map_link, primary_skill, bio, mode, verification_status, credibility, created_at, updated_at, score
    FROM scored
    ${cursorClause}
    ORDER BY score DESC, updated_at DESC, id DESC
    LIMIT $${limitParamIndex}`;

  const rows = await query<any>(finalSql, params);
  const mapped = rows.rows.map(mapProfileRow);

  let nextCursor: string | undefined = undefined;
  if (rows.rows.length === limit) {
    const last = rows.rows[rows.rows.length - 1];
    try {
      nextCursor = Buffer.from(
        JSON.stringify({ kind: "search", score: Number(last.score), updatedAt: new Date(last.updated_at).toISOString(), id: last.id }),
      ).toString("base64");
    } catch {}
  }

  return { providers: mapped, nextCursor };
}

export async function incrementProfileViews(profileId: string): Promise<void> {
  await ensureProfilesTable();
  await execute(`UPDATE profiles SET view_count = view_count + 1 WHERE id = $1`, [profileId]);
}

export async function incrementProfileContacts(profileId: string): Promise<void> {
  await ensureProfilesTable();
  await execute(`UPDATE profiles SET contact_count = contact_count + 1 WHERE id = $1`, [profileId]);
}

export async function updateProfileLastActive(userId: string): Promise<void> {
  await ensureProfilesTable();
  await execute(`UPDATE profiles SET last_active_at = now() WHERE user_id = $1`, [userId]);
}

export async function getMetrics(): Promise<Metrics> {
  await ensureProfilesTable();

  const totalResult = await query<{ count: string }>(`select count(*) from profiles`);
  const providerResult = await query<{ count: string }>(
    `select count(*) from profiles where mode in ('provider','both')`,
  );
  const verifiedResult = await query<{ count: string }>(
    `select count(*) from profiles where mode in ('provider','both') and verification_status = 'verified'`,
  );
  const skillsResult = await query<{ primary_skill: string | null }>(
    `select distinct lower(trim(primary_skill)) as primary_skill from profiles where mode in ('provider','both') and primary_skill is not null`,
  );

  const totalStudents = Number(totalResult.rows[0]?.count ?? 0);
  const providerCount = Number(providerResult.rows[0]?.count ?? 0);
  const verifiedCount = Number(verifiedResult.rows[0]?.count ?? 0);
  const activeCategories = skillsResult.rows.filter((r) => r.primary_skill).length;

  const verifiedProviderRate = providerCount > 0 ? Math.round((verifiedCount / providerCount) * 100) : 0;

  return {
    totalStudents,
    providerCount,
    verifiedProviderRate,
    activeCategories,
  };
}
