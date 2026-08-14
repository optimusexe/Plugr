import { execute, query } from "@/lib/azure/postgres";
import type { StoreProduct } from "@/lib/types";

function makeId(): string {
  return `prd_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

type ProductRow = {
  id: string;
  provider_id: string;
  provider_user_id: string;
  name: string;
  description: string | null;
  price: string | null;
  category: string | null;
  image_urls: unknown;
  view_count: number;
  click_count: number;
  created_at: string | Date;
  updated_at: string | Date;
  store_name?: string | null;
  store_slug?: string | null;
};

function parseImageUrls(value: unknown): string[] {
  if (!value) return [];
  const raw = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => String(item ?? "").trim())
    .filter((item) => item.startsWith("http"));
}

function mapProductRow(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    providerId: row.provider_id,
    providerUserId: row.provider_user_id,
    name: row.name,
    description: row.description ?? undefined,
    price: row.price ?? undefined,
    category: row.category ?? undefined,
    imageUrls: parseImageUrls(row.image_urls),
    viewCount: typeof row.view_count === "number" ? row.view_count : Number(row.view_count) || 0,
    clickCount: typeof row.click_count === "number" ? row.click_count : Number(row.click_count) || 0,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    storeName: row.store_name ?? undefined,
    storeSlug: row.store_slug ?? undefined,
  };
}

let productsTableReady: Promise<void> | null = null;

async function ensureProductsTable(): Promise<void> {
  if (!productsTableReady) {
    productsTableReady = (async () => {
      await execute(`
        create table if not exists products (
          id text primary key,
          provider_id text not null,
          provider_user_id text not null,
          name text not null,
          description text null,
          price text null,
          category text null,
          image_urls jsonb not null default '[]',
          view_count integer not null default 0,
          click_count integer not null default 0,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);
      try {
        await execute(`create index if not exists products_provider_idx on products(provider_id)`);
        await execute(`create index if not exists products_category_idx on products(category)`);
        await execute(`create index if not exists products_created_at_idx on products(created_at desc)`);
      } catch (err) {
        console.warn("products index creation warning:", err);
      }
    })().catch((error) => {
      productsTableReady = null;
      throw error;
    });
  }

  await productsTableReady;
}

export async function createProduct(input: {
  providerId: string;
  providerUserId: string;
  name: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrls: string[];
}): Promise<StoreProduct> {
  await ensureProductsTable();

  const now = new Date().toISOString();
  const product: StoreProduct = {
    id: makeId(),
    providerId: input.providerId,
    providerUserId: input.providerUserId,
    name: normalizeText(input.name),
    description: input.description ? input.description.trim() : undefined,
    price: input.price ? input.price.trim() : undefined,
    category: input.category ? input.category.trim() : undefined,
    imageUrls: input.imageUrls,
    viewCount: 0,
    clickCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await query<ProductRow>(
    `insert into products (
      id, provider_id, provider_user_id, name, description, price, category,
      image_urls, view_count, click_count, created_at, updated_at
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11::timestamptz, $12::timestamptz
    ) returning *`,
    [
      product.id,
      product.providerId,
      product.providerUserId,
      product.name,
      product.description ?? null,
      product.price ?? null,
      product.category ?? null,
      JSON.stringify(product.imageUrls),
      product.viewCount,
      product.clickCount,
      product.createdAt,
      product.updatedAt,
    ],
  );

  return mapProductRow(result.rows[0]);
}

export async function getProductById(id: string): Promise<StoreProduct | null> {
  await ensureProductsTable();
  const result = await query<ProductRow>(
    `select p.*, s.name as store_name, s.slug as store_slug
     from products p
     left join stores s on s.provider_id = p.provider_id
     where p.id = $1 limit 1`,
    [id],
  );
  return result.rows[0] ? mapProductRow(result.rows[0]) : null;
}

export async function getProductsByProvider(providerId: string, limit = 50): Promise<StoreProduct[]> {
  await ensureProductsTable();
  const result = await query<ProductRow>(
    `select * from products where provider_id = $1 order by created_at desc limit $2`,
    [providerId, limit],
  );
  return result.rows.map(mapProductRow);
}

export async function getProductsByProviderUserId(providerUserId: string, limit = 100): Promise<StoreProduct[]> {
  await ensureProductsTable();
  const result = await query<ProductRow>(
    `select * from products where provider_user_id = $1 order by created_at desc limit $2`,
    [providerUserId, limit],
  );
  return result.rows.map(mapProductRow);
}

export async function countProductsByProvider(providerId: string): Promise<number> {
  await ensureProductsTable();
  const result = await query<{ count: string }>(
    `select count(*) as count from products where provider_id = $1`,
    [providerId],
  );
  return parseInt(result.rows[0]?.count || "0", 10);
}

export type ProductsPage = { products: StoreProduct[]; nextCursor?: string };

type ProductsCursor = { created_at: string; id: string };

export async function getProducts(
  input: { category?: string; providerId?: string; q?: string; limit?: number; cursor?: ProductsCursor } = {},
): Promise<ProductsPage> {
  await ensureProductsTable();

  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (input.category) {
    params.push(input.category);
    conditions.push(`p.category = $${params.length}`);
  }

  if (input.providerId) {
    params.push(input.providerId);
    conditions.push(`p.provider_id = $${params.length}`);
  }

  const q = input.q ? input.q.trim() : "";
  if (q) {
    params.push(`%${q}%`);
    conditions.push(
      `(p.name ilike $${params.length} or coalesce(p.description, '') ilike $${params.length} or coalesce(p.category, '') ilike $${params.length})`,
    );
  }

  if (input.cursor) {
    params.push(input.cursor.created_at);
    const cursorIdx = params.length;
    params.push(input.cursor.id);
    conditions.push(`(p.created_at < $${cursorIdx}::timestamptz or (p.created_at = $${cursorIdx}::timestamptz and p.id < $${cursorIdx + 1}))`);
  }

  params.push(limit + 1);
  const limitIdx = params.length;

  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const result = await query<ProductRow>(
    `select p.*, s.name as store_name, s.slug as store_slug
     from products p
     left join stores s on s.provider_id = p.provider_id
     ${whereClause} order by p.created_at desc, p.id desc limit $${limitIdx}`,
    params,
  );

  const rows = result.rows;
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  let nextCursor: string | undefined;
  if (hasMore && pageRows.length > 0) {
    const last = pageRows[pageRows.length - 1];
    nextCursor = Buffer.from(JSON.stringify({ created_at: last.created_at, id: last.id })).toString("base64");
  }

  return { products: pageRows.map(mapProductRow), nextCursor };
}

export async function updateProduct(
  id: string,
  patch: { name?: string; description?: string; price?: string; category?: string; imageUrls?: string[] },
): Promise<StoreProduct | null> {
  await ensureProductsTable();

  const existing = await getProductById(id);
  if (!existing) {
    return null;
  }

  const next: StoreProduct = {
    ...existing,
    name: patch.name !== undefined ? normalizeText(patch.name) : existing.name,
    description: patch.description !== undefined ? patch.description.trim() : existing.description,
    price: patch.price !== undefined ? patch.price.trim() : existing.price,
    category: patch.category !== undefined ? patch.category.trim() : existing.category,
    imageUrls: patch.imageUrls !== undefined ? patch.imageUrls : existing.imageUrls,
    updatedAt: new Date().toISOString(),
  };

  const result = await query<ProductRow>(
    `update products set
       name = $2, description = $3, price = $4, category = $5, image_urls = $6::jsonb, updated_at = $7::timestamptz
     where id = $1
     returning *`,
    [
      next.id,
      next.name,
      next.description ?? null,
      next.price ?? null,
      next.category ?? null,
      JSON.stringify(next.imageUrls),
      next.updatedAt,
    ],
  );

  return result.rows[0] ? mapProductRow(result.rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await ensureProductsTable();
  const result = await query<{ id: string }>(`delete from products where id = $1 returning id`, [id]);
  return result.rows.length > 0;
}

export async function incrementProductViews(productId: string): Promise<void> {
  await ensureProductsTable();
  await execute(`update products set view_count = view_count + 1 where id = $1`, [productId]);
}

export async function incrementProductClicks(productId: string): Promise<void> {
  await ensureProductsTable();
  await execute(`update products set click_count = click_count + 1 where id = $1`, [productId]);
}

export async function getAllProducts(limit = 500): Promise<StoreProduct[]> {
  await ensureProductsTable();
  const result = await query<ProductRow>(
    `select * from products order by created_at desc limit $1`,
    [limit],
  );
  return result.rows.map(mapProductRow);
}
