import { Pool, type QueryResultRow } from "pg";
import {
  getDatabaseUrl,
  getPostgresConnectTimeoutMs,
  getPostgresQueryTimeoutMs,
  shouldUsePostgresSsl,
  getPostgresSlowQueryMs,
  getPostgresMaxRetries,
} from "./config";
import { logApiError, resolveApiError } from "@/lib/api-error";

let pool: Pool | null = null;

export function hasPostgresConnection(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getPostgresPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PostgreSQL access.");
  }

  pool = new Pool({
    connectionString,
    ssl: shouldUsePostgresSsl() ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: getPostgresConnectTimeoutMs(),
    query_timeout: getPostgresQueryTimeoutMs(),
    statement_timeout: getPostgresQueryTimeoutMs(),
    idleTimeoutMillis: 30000,
  });

  pool.on("error", (error) => {
    const resolved = resolveApiError(error, {
      defaultStatus: 500,
      defaultMessage: "Database connection issue.",
    });
    logApiError("postgres/pool", resolved, error);
  });

  return pool;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<{ rows: T[] }> {
  const activePool = getPostgresPool();
  const maxRetries = getPostgresMaxRetries();
  let attempt = 0;
  while (true) {
    try {
      const start = Date.now();
      const result = await activePool.query<T>(text, params);
      const duration = Date.now() - start;
      try {
        const slowThreshold = getPostgresSlowQueryMs();
        if (duration > slowThreshold) {
          console.warn(`[pg] slow query ${duration}ms`, { sql: text.slice(0, 1000), duration, params });
        } else if (process.env.NODE_ENV !== "production") {
          console.debug(`[pg] query ${duration}ms`, { sql: text.slice(0, 500), duration });
        }
      } catch {
        // ignore logging failures
      }

      return { rows: result.rows };
    } catch (err: any) {
      attempt += 1;
      const msg = String(err?.message || err);
      const isTransient = /timeout|timed out|ETIMEDOUT|Connection terminated|read timeout|ECONNRESET/i.test(msg);
      if (!isTransient || attempt > maxRetries) {
        throw err;
      }
      // exponential backoff before retrying
      const backoff = 100 * attempt;
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
}

export async function execute(text: string, params: unknown[] = []): Promise<void> {
  const activePool = getPostgresPool();
  const maxRetries = 2;
  let attempt = 0;
  while (true) {
    try {
      const start = Date.now();
      await activePool.query(text, params);
      const duration = Date.now() - start;
      try {
        if (duration > 200) {
          console.warn(`[pg] slow execute ${duration}ms`, { sql: text.slice(0, 1000), duration, params });
        } else if (process.env.NODE_ENV !== "production") {
          console.debug(`[pg] execute ${duration}ms`, { duration });
        }
      } catch {}

      return;
    } catch (err: any) {
      attempt += 1;
      const msg = String(err?.message || err);
      const isTransient = /timeout|timed out|ETIMEDOUT|Connection terminated|read timeout|ECONNRESET/i.test(msg);
      if (!isTransient || attempt > maxRetries) {
        throw err;
      }
      const backoff = 100 * attempt;
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
}