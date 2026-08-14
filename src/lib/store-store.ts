import { execute, getPostgresPool, query } from "@/lib/azure/postgres";
import type { Store, StoreWithStats } from "@/lib/types";

function makeId(): string {
  return `st_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function slugifyName(name: string): string {
  return normalizeText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "store";
}

type StoreRow = {
  id: string;
  provider_id: string;
  provider_user_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  banner_url: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function mapStoreRow(row: StoreRow): Store {
  return {
    id: row.id,
    providerId: row.provider_id,
    providerUserId: row.provider_user_id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? undefined,
    description: row.description ?? undefined,
    bannerUrl: row.banner_url ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

let storesTableReady: Promise<void> | null = null;

async function ensureStoresTable(): Promise<void> {
  if (!storesTableReady) {
    storesTableReady = (async () => {
      await execute(`
        create table if not exists stores (
          id text primary key,
          provider_id text not null,
          provider_user_id text not null,
          slug text not null unique,
          name text not null,
          tagline text null,
          description text null,
          banner_url text null,
          logo_url text null,
          whatsapp text null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);
      try {
        await execute(`create index if not exists stores_provider_idx on stores(provider_id)`);
        await execute(`create index if not exists stores_updated_at_idx on stores(updated_at desc)`);
        await execute(`alter table stores add column if not exists logo_url text null`);
      } catch (err) {
        console.warn("stores index creation warning:", err);
      }
    })().catch((error) => {
      storesTableReady = null;
      throw error;
    });
  }

  await storesTableReady;
}

async function slugExists(slug: string): Promise<boolean> {
  const result = await query<{ id: string }>(`select id from stores where slug = $1 limit 1`, [slug]);
  return result.rows.length > 0;
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugifyName(name);
  if (!(await slugExists(base))) {
    return base;
  }
  for (let i = 1; i < 100; i += 1) {
    const candidate = `${base}-${i}`;
    if (!(await slugExists(candidate))) {
      return candidate;
    }
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createStore(input: {
  providerId: string;
  providerUserId: string;
  name: string;
  tagline?: string;
  description?: string;
  bannerUrl?: string;
  logoUrl?: string;
  whatsapp?: string;
}): Promise<Store> {
  await ensureStoresTable();
  const slug = await uniqueSlug(input.name);
  const result = await query<StoreRow>(
    `insert into stores (id, provider_id, provider_user_id, slug, name, tagline, description, banner_url, logo_url, whatsapp)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning *`,
    [
      makeId(),
      input.providerId,
      input.providerUserId,
      slug,
      normalizeText(input.name),
      input.tagline?.trim() || null,
      input.description?.trim() || null,
      input.bannerUrl || null,
      input.logoUrl || null,
      input.whatsapp?.trim() || null,
    ],
  );
  return mapStoreRow(result.rows[0]);
}

export async function getStoreByProviderId(providerId: string): Promise<Store | null> {
  await ensureStoresTable();
  const result = await query<StoreRow>(`select * from stores where provider_id = $1 limit 1`, [providerId]);
  return result.rows[0] ? mapStoreRow(result.rows[0]) : null;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  await ensureStoresTable();
  const result = await query<StoreRow>(`select * from stores where slug = $1 limit 1`, [slug]);
  return result.rows[0] ? mapStoreRow(result.rows[0]) : null;
}

export async function getStoreById(id: string): Promise<Store | null> {
  await ensureStoresTable();
  const result = await query<StoreRow>(`select * from stores where id = $1 limit 1`, [id]);
  return result.rows[0] ? mapStoreRow(result.rows[0]) : null;
}

export async function updateStore(
  id: string,
  patch: {
    name?: string;
    tagline?: string;
    description?: string;
    bannerUrl?: string;
    logoUrl?: string;
    whatsapp?: string;
  },
): Promise<Store | null> {
  await ensureStoresTable();
  const existing = await getStoreById(id);
  if (!existing) {
    return null;
  }

  let slug = existing.slug;
  if (patch.name !== undefined) {
    const nextName = normalizeText(patch.name);
    const base = slugifyName(nextName);
    if (base !== existing.slug) {
      if (!(await slugExists(base))) {
        slug = base;
      } else {
        slug = await uniqueSlug(nextName);
      }
    }
  }

  const result = await query<StoreRow>(
    `update stores set
       slug = $2, name = $3, tagline = $4, description = $5, banner_url = $6, logo_url = $7, whatsapp = $8, updated_at = now()
     where id = $1
     returning *`,
    [
      id,
      slug,
      patch.name !== undefined ? normalizeText(patch.name) : existing.name,
      patch.tagline !== undefined ? patch.tagline.trim() || null : existing.tagline ?? null,
      patch.description !== undefined ? patch.description.trim() || null : existing.description ?? null,
      patch.bannerUrl !== undefined ? patch.bannerUrl || null : existing.bannerUrl ?? null,
      patch.logoUrl !== undefined ? patch.logoUrl || null : existing.logoUrl ?? null,
      patch.whatsapp !== undefined ? patch.whatsapp.trim() || null : existing.whatsapp ?? null,
    ],
  );

  return result.rows[0] ? mapStoreRow(result.rows[0]) : null;
}

export async function listStores(
  input: { q?: string; limit?: number; providerId?: string } = {},
): Promise<StoreWithStats[]> {
  await ensureStoresTable();
  const limit = Math.min(Math.max(input.limit ?? 12, 1), 50);
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (input.providerId) {
    params.push(input.providerId);
    conditions.push(`s.provider_id = $${params.length}`);
  }

  const q = input.q ? input.q.trim() : "";
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(s.name ilike $${params.length} or coalesce(s.tagline, '') ilike $${params.length})`);
  }

  params.push(limit);
  const limitIdx = params.length;
  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  const result = await query<StoreRow & { product_count: string; provider_name: string | null }>(
    `select s.*, count(p.id) as product_count, pr.full_name as provider_name
     from stores s
     left join products p on p.provider_id = s.provider_id
     left join profiles pr on pr.id = s.provider_id
     ${whereClause}
     group by s.id, pr.full_name
     order by product_count desc, s.updated_at desc
     limit $${limitIdx}`,
    params,
  );

  return result.rows.map((row) => ({
    ...mapStoreRow(row),
    productCount: parseInt(row.product_count || "0", 10),
    providerName: row.provider_name ?? undefined,
  }));
}

export async function countStores(): Promise<number> {
  await ensureStoresTable();
  const result = await query<{ count: string }>(`select count(*) as count from stores`);
  return parseInt(result.rows[0]?.count || "0", 10);
}

export async function deleteStore(id: string): Promise<boolean> {
  await ensureStoresTable();
  const existing = await getStoreById(id);
  if (!existing) {
    return false;
  }

  const client = await getPostgresPool().connect();
  try {
    await client.query("begin");
    await client.query(`delete from stores where id = $1`, [id]);
    await client.query(`delete from products where provider_id = $1`, [existing.providerId]);
    await client.query("commit");
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
