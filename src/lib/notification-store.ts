import crypto from "node:crypto";
import { execute, query } from "@/lib/azure/postgres";
import { getUsers } from "@/lib/auth-store";
import type { AdminBroadcastSummary, Notification, NotificationBroadcastPayload, NotificationSummary, NotificationType } from "@/lib/types";

type NotificationRow = {
  id: string;
  broadcast_id: string | null;
  user_id: string;
  title: string;
  message: string;
  action_url: string | null;
  type: NotificationType;
  read_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

let notificationsTableReady: Promise<void> | null = null;

function createNotificationId(): string {
  return `n_${Math.random().toString(36).slice(2, 10)}`;
}

function createBroadcastId(): string {
  return `nb_${crypto.randomBytes(6).toString("hex")}`;
}

function toIsoString(value: string | Date | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    broadcastId: row.broadcast_id ?? undefined,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    actionUrl: row.action_url ?? undefined,
    type: row.type,
    readAt: toIsoString(row.read_at),
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
  };
}

function toSummary(notification: Notification): NotificationSummary {
  return {
    ...notification,
    isRead: Boolean(notification.readAt),
  };
}

async function ensureNotificationsTable(): Promise<void> {
  if (!notificationsTableReady) {
    notificationsTableReady = execute(`
      create table if not exists notifications (
        id text primary key,
        broadcast_id text null,
        user_id text not null,
        title text not null,
        message text not null,
        action_url text null,
        type text not null default 'system',
        read_at timestamptz null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `)
      .then(async () => {
        await execute(`alter table notifications add column if not exists broadcast_id text null`);
        await execute(`alter table notifications add column if not exists action_url text null`);
        await execute(`alter table notifications add column if not exists type text not null default 'system'`);
        await execute(`alter table notifications add column if not exists read_at timestamptz null`);
        await execute(`alter table notifications add column if not exists updated_at timestamptz not null default now()`);
        await execute(`create index if not exists notifications_user_created_idx on notifications (user_id, created_at desc)`);
        await execute(`create index if not exists notifications_user_unread_idx on notifications (user_id, read_at)`);
        await execute(`create index if not exists notifications_broadcast_idx on notifications (broadcast_id, created_at desc)`);
      })
      .catch((error) => {
        notificationsTableReady = null;
        throw error;
      });
  }

  await notificationsTableReady;
}

const broadcastGroupingKeySql = `coalesce(
  broadcast_id,
  md5(
    type || '|' ||
    title || '|' ||
    message || '|' ||
    coalesce(action_url, '') || '|' ||
    to_char(date_trunc('minute', created_at), 'YYYY-MM-DD HH24:MI')
  )
)`;

async function readNotificationsFromDb(userId: string, limit = 20): Promise<Notification[]> {
  await ensureNotificationsTable();
  const result = await query<NotificationRow>(
    `select * from notifications where user_id = $1 order by created_at desc limit $2`,
    [userId, Math.max(1, Math.min(100, limit))],
  );

  return result.rows.map(mapNotificationRow);
}

async function readUnreadCountFromDb(userId: string): Promise<number> {
  await ensureNotificationsTable();
  const result = await query<{ count: string }>(
    `select count(*)::text as count from notifications where user_id = $1 and read_at is null`,
    [userId],
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string,
  type: NotificationType = "system",
  broadcastId?: string,
): Promise<Notification> {
  await ensureNotificationsTable();
  const now = new Date().toISOString();
  const result = await query<NotificationRow>(
    `insert into notifications (id, broadcast_id, user_id, title, message, action_url, type, created_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz)
     returning *`,
    [createNotificationId(), broadcastId ?? null, userId, title, message, actionUrl ?? null, type, now, now],
  );

  return mapNotificationRow(result.rows[0]);
}

export async function broadcastNotification(payload: NotificationBroadcastPayload): Promise<{ recipientCount: number; notifications: Notification[] }> {
  const users = await getUsers();
  const recipients =
    payload.target === "specific"
      ? users.filter((user) => payload.userIds?.includes(user.id))
      : users;

  const broadcastId = createBroadcastId();
  const notifications: Notification[] = [];
  for (const user of recipients) {
    notifications.push(
      await createNotification(user.id, payload.title, payload.message, payload.actionUrl, "admin-broadcast", broadcastId),
    );
  }

  return {
    recipientCount: recipients.length,
    notifications,
  };
}

export async function getNotificationsForUser(userId: string, limit = 20): Promise<NotificationSummary[]> {
  const notifications = await readNotificationsFromDb(userId, limit);
  return notifications.map(toSummary);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return readUnreadCountFromDb(userId);
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<NotificationSummary | null> {
  await ensureNotificationsTable();
  const result = await query<NotificationRow>(
    `update notifications
     set read_at = coalesce(read_at, now()),
         updated_at = now()
     where id = $1 and user_id = $2
     returning *`,
    [notificationId, userId],
  );

  const notification = result.rows[0] ? mapNotificationRow(result.rows[0]) : null;
  return notification ? toSummary(notification) : null;
}

export async function getNotificationById(notificationId: string): Promise<Notification | null> {
  await ensureNotificationsTable();
  const result = await query<NotificationRow>(`select * from notifications where id = $1 limit 1`, [notificationId]);
  return result.rows[0] ? mapNotificationRow(result.rows[0]) : null;
}

export async function getRecentBroadcasts(limit = 20): Promise<AdminBroadcastSummary[]> {
  await ensureNotificationsTable();
  const result = await query<{
    broadcast_id: string | null;
    title: string;
    message: string;
    action_url: string | null;
    type: NotificationType;
    recipient_count: string;
    created_at: string | Date;
    updated_at: string | Date;
  }>(
    `select ${broadcastGroupingKeySql} as broadcast_id,
            max(title) as title,
            max(message) as message,
            max(action_url) as action_url,
            max(type) as type,
            count(*)::text as recipient_count,
            max(created_at) as created_at,
            max(updated_at) as updated_at
     from notifications
     where type = 'admin-broadcast'
     group by ${broadcastGroupingKeySql}
     order by max(created_at) desc
     limit $1`,
    [Math.max(1, Math.min(50, limit))],
  );

  return result.rows.map((row) => ({
    broadcastId: row.broadcast_id ?? "",
    title: row.title,
    message: row.message,
    actionUrl: row.action_url ?? undefined,
    type: row.type,
    recipientCount: Number(row.recipient_count ?? 0),
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
  }));
}

export async function deleteBroadcastNotifications(broadcastId: string): Promise<number> {
  await ensureNotificationsTable();
  const result = await query<{ id: string }>(
    `delete from notifications where ${broadcastGroupingKeySql} = $1 returning id`,
    [broadcastId],
  );

  return result.rows.length;
}
