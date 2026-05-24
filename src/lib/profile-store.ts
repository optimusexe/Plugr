import { execute, query } from "@/lib/azure/postgres";
import { getRankingWeightVerified, getRankingWeightCredibility, getRankingWeightRelevance, getRankingRecencyDays } from "@/lib/azure/config";
import { runMigrationsAtStartup } from "@/lib/azure/config";
import type { ProfileMode, ProfileProduct, RegisterPayload, StudentProfile, VerificationStatus } from "@/lib/types";

type Metrics = {
  totalStudents: number;
  providerCount: number;
  verifiedProviderRate: number;
  activeCategories: number;
};

let profilesTableReady: Promise<void> | null = null;

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
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function ensureProfilesTable(): Promise<void> {
  if (!profilesTableReady) {
    profilesTableReady = (async () => {
      // If migrations are managed externally, skip runtime DDL.
      if (!runMigrationsAtStartup()) {
        return;
      }
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
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );
      `);

      // Create indexes where possible. Some managed Postgres (Azure) may not allow pg_trgm extension;
      // attempt trigram/index creation but ignore permission errors so runtime flows are not blocked.
      try {
        await execute(`create index if not exists profiles_mode_idx on profiles(mode)`);
        await execute(`create index if not exists profiles_verification_idx on profiles(verification_status)`);
        await execute(`create index if not exists profiles_updated_at_idx on profiles(updated_at desc)`);
        // Trigram/indexes - may fail on managed hosts without extension privileges
        try {
          await execute(`create index if not exists profiles_fullname_trgm on profiles using gin (full_name gin_trgm_ops)`);
          await execute(`create index if not exists profiles_primaryskill_trgm on profiles using gin (primary_skill gin_trgm_ops)`);
          await execute(`create index if not exists profiles_search_tsv on profiles using gin (to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')))`);
        } catch (innerErr: any) {
          const msg = String(innerErr?.message || innerErr);
          // Ignore extension/permission errors (Azure: 0A000) but log for diagnostics
          if (/pg_trgm|extension .* not allow-listed|0A000/i.test(msg)) {
            console.warn("pg_trgm not available or not permitted; skipping trigram indexes");
          } else {
            throw innerErr;
          }
        }
      } catch (err) {
        // Log unexpected index creation errors but don't prevent table readiness in most cases.
        try {
          console.warn("profiles index creation warning:", err);
        } catch {}
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
       id, user_id, profile_image, full_name, primary_skill,
       mode, verification_status, credibility, created_at, updated_at
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
      location_text, map_link, primary_skill, bio, mode, verification_status, credibility, created_at, updated_at
    ) values (
      $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::timestamptz, $19::timestamptz
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
    verificationStatus:
      existing.verificationStatus === "verified" && normalizeText(payload.fullName) !== existing.fullName
        ? "pending"
        : existing.verificationStatus,
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

export async function findProviders(
  search: string,
  verifiedOnly: boolean,
  limit = 20,
  cursor?: { score: number; updatedAt: string; id: string } | null,
): Promise<ProvidersPage> {
  await ensureProfilesTable();

  const q = search ? search.trim() : "";
  const hasQuery = q.length > 0;

  const RECENCY_T = getRankingRecencyDays(); // days

  // scoring expression (weights configurable via env vars)
  const scoringExpr = `
    (case when verification_status='verified' then 1 else 0 end) * ${getRankingWeightVerified()}
    + (coalesce(credibility,0)/100.0) * ${getRankingWeightCredibility()}
    + coalesce(ts_rank_cd(to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')), plainto_tsquery(${hasQuery ? "$1" : "NULL"})),0) * ${getRankingWeightRelevance()}
    + exp(-(extract(epoch from (now() - updated_at))/86400.0) / ${RECENCY_T})
  `;

  const whereParts: string[] = ["mode in ('provider','both')"];
  const params: unknown[] = [];
  if (hasQuery) {
    whereParts.push(`to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')) @@ plainto_tsquery($1)`);
    params.push(q);
  }
  if (verifiedOnly) whereParts.push("verification_status = 'verified'");

  const scoredCte = `WITH scored AS (
    SELECT id, user_id, profile_image, products, full_name, faculty, department, level, phone, email, location_text, map_link, primary_skill, bio, mode, verification_status, credibility, created_at, updated_at, (${scoringExpr}) AS score
    FROM profiles
    WHERE ${whereParts.join(' AND ')}
  )`;

  let cursorClause = "";
  if (cursor) {
    // keyset: score desc, updated_at desc, id desc
    params.push(cursor.score, cursor.updatedAt, cursor.id);
    const scoreParamIndex = params.length - 2; // score param index (1-based in SQL will be +1)
    const updatedParamIndex = params.length - 1;
    const idParamIndex = params.length;
    // Use parameter positions relative to params array length - we'll use $n directly
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
      nextCursor = Buffer.from(JSON.stringify({ score: Number(last.score), updatedAt: new Date(last.updated_at).toISOString(), id: last.id })).toString(
        "base64",
      );
    } catch {}
  }

  return { providers: mapped, nextCursor };
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
