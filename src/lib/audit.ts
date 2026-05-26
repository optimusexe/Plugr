import { execute } from "@/lib/azure/postgres";

function createId(prefix = "a_") {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

export async function logAudit(userId: string | null, action: string, details?: unknown): Promise<void> {
  const id = createId();
  const sql = `insert into audit_logs (id, user_id, action, details, created_at) values ($1, $2, $3, $4::jsonb, now())`;
  try {
    await execute(sql, [id, userId, action, details ? JSON.stringify(details) : null]);
  } catch (e) {
    // swallow audit errors to avoid blocking primary flows
    console.warn("Failed to write audit log:", e instanceof Error ? e.message : String(e));
  }
}

export default { logAudit };
