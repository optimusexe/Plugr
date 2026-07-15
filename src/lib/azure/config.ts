function env(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function envInt(name: string, fallback: number): number {
  const raw = env(name);
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function getDatabaseUrl(): string | null {
  return env("DATABASE_URL");
}

export function shouldUseDatabase(): boolean {
  return Boolean(getDatabaseUrl());
}

export function shouldUsePostgresSsl(): boolean {
  return (process.env.POSTGRES_SSL ?? "").trim().toLowerCase() === "true";
}

export function getPostgresConnectTimeoutMs(): number {
  return envInt("POSTGRES_CONNECT_TIMEOUT_MS", 5000);
}

export function getPostgresQueryTimeoutMs(): number {
  return envInt("POSTGRES_QUERY_TIMEOUT_MS", 10000);
}

export function getRankingWeightVerified(): number {
  const raw = process.env.RANK_WEIGHT_VERIFIED ?? "2.0";
  const v = Number(raw);
  return Number.isFinite(v) ? v : 2.0;
}

export function getRankingWeightCredibility(): number {
  const raw = process.env.RANK_WEIGHT_CREDIBILITY ?? "1.5";
  const v = Number(raw);
  return Number.isFinite(v) ? v : 1.5;
}

export function getRankingWeightRelevance(): number {
  const raw = process.env.RANK_WEIGHT_RELEVANCE ?? "1.8";
  const v = Number(raw);
  return Number.isFinite(v) ? v : 1.8;
}

export function getRankingRecencyDays(): number {
  return envInt("RANK_RECENCY_DAYS", 30);
}

export function getRankingWeightEngagement(): number {
  const raw = process.env.RANK_WEIGHT_ENGAGEMENT ?? "0.8";
  const v = Number(raw);
  return Number.isFinite(v) ? v : 0.8;
}

export function getRankingWeightFreshness(): number {
  const raw = process.env.RANK_WEIGHT_FRESHNESS ?? "0.6";
  const v = Number(raw);
  return Number.isFinite(v) ? v : 0.6;
}

export function getPostgresSlowQueryMs(): number {
  return envInt("POSTGRES_SLOW_QUERY_MS", 200);
}

export function getPostgresMaxRetries(): number {
  return envInt("POSTGRES_MAX_RETRIES", 2);
}

export function runMigrationsAtStartup(): boolean {
  return (process.env.RUN_MIGRATIONS_AT_STARTUP ?? "").trim().toLowerCase() === "true";
}

export function getAzureStorageConnectionString(): string | null {
  return env("AZURE_STORAGE_CONNECTION_STRING");
}

export function getAzureStorageContainer(): string {
  return env("AZURE_STORAGE_CONTAINER") ?? "plugr-files";
}

export function getAzureCommunicationConnectionString(): string | null {
  return env("AZURE_COMMUNICATION_CONNECTION_STRING");
}

export function getAzureCommunicationEmailSender(): string | null {
  return env("AZURE_COMMUNICATION_EMAIL_SENDER");
}

export function getAzureCommunicationSmsFrom(): string | null {
  return env("AZURE_COMMUNICATION_SMS_FROM");
}

export function getGoogleMapsApiKey(): string | null {
  return env("GOOGLE_MAPS_API_KEY");
}

export function getAdminBootstrapEmails(): string[] {
  const raw = env("PLUGR_ADMIN_EMAILS");

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function hasAzureMessaging(): boolean {
  return Boolean(getAzureCommunicationConnectionString());
}