import { execute, query } from "@/lib/azure/postgres";
import { getProfileByUserId } from "@/lib/profile-store";
import { getUserById } from "@/lib/auth-store";
import type {
  SupportConversation,
  SupportConversationStatus,
  SupportConversationSummary,
  SupportConversationView,
  SupportMessage,
  SupportMessageSender,
} from "@/lib/types";

type SupportConversationRow = {
  id: string;
  user_id: string;
  subject: string;
  status: SupportConversationStatus;
  assigned_admin_id: string | null;
  last_message_at: string | Date;
  waiting_since: string | Date | null;
  first_notice_sent_at: string | Date | null;
  second_notice_sent_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type SupportMessageRow = {
  id: string;
  conversation_id: string;
  sender_role: SupportMessageSender;
  sender_user_id: string | null;
  body: string;
  created_at: string | Date;
};

let supportTablesReady: Promise<void> | null = null;

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toIso(value: string | Date | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapConversationRow(row: SupportConversationRow): SupportConversation {
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    status: row.status,
    assignedAdminId: row.assigned_admin_id ?? undefined,
    lastMessageAt: toIso(row.last_message_at) ?? new Date().toISOString(),
    waitingSince: toIso(row.waiting_since),
    firstNoticeSentAt: toIso(row.first_notice_sent_at),
    secondNoticeSentAt: toIso(row.second_notice_sent_at),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
  };
}

function mapMessageRow(row: SupportMessageRow): SupportMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id ?? undefined,
    body: row.body,
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
  };
}

async function ensureSupportTables(): Promise<void> {
  if (!supportTablesReady) {
    supportTablesReady = (async () => {
      await execute(`
        create table if not exists support_conversations (
          id text primary key,
          user_id text not null,
          subject text not null,
          status text not null default 'waiting_admin',
          assigned_admin_id text null,
          last_message_at timestamptz not null default now(),
          waiting_since timestamptz null,
          first_notice_sent_at timestamptz null,
          second_notice_sent_at timestamptz null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);

      await execute(`
        create table if not exists support_messages (
          id text primary key,
          conversation_id text not null,
          sender_role text not null,
          sender_user_id text null,
          body text not null,
          created_at timestamptz not null default now()
        )
      `);
    })().catch((error) => {
      supportTablesReady = null;
      throw error;
    });
  }

  await supportTablesReady;
}

async function readConversationRow(conversationId: string): Promise<SupportConversation | null> {
  await ensureSupportTables();
  const result = await query<SupportConversationRow>(`select * from support_conversations where id = $1 limit 1`, [conversationId]);
  return result.rows[0] ? mapConversationRow(result.rows[0]) : null;
}

async function readMessages(conversationId: string): Promise<SupportMessage[]> {
  await ensureSupportTables();
  const result = await query<SupportMessageRow>(`select * from support_messages where conversation_id = $1 order by created_at asc`, [conversationId]);
  return result.rows.map(mapMessageRow);
}

async function readLatestActiveConversationForUser(userId: string): Promise<SupportConversation | null> {
  await ensureSupportTables();
  const result = await query<SupportConversationRow>(
    `select * from support_conversations where user_id = $1 and status <> 'closed' order by updated_at desc limit 1`,
    [userId],
  );
  return result.rows[0] ? mapConversationRow(result.rows[0]) : null;
}

async function insertMessage(input: { conversationId: string; senderRole: SupportMessageSender; senderUserId?: string; body: string }): Promise<SupportMessage> {
  await ensureSupportTables();
  const now = new Date().toISOString();
  const message: SupportMessage = {
    id: makeId("sm"),
    conversationId: input.conversationId,
    senderRole: input.senderRole,
    senderUserId: input.senderUserId,
    body: normalizeText(input.body),
    createdAt: now,
  };

  await query<SupportMessageRow>(
    `insert into support_messages (id, conversation_id, sender_role, sender_user_id, body, created_at)
     values ($1, $2, $3, $4, $5, $6::timestamptz)` ,
    [message.id, message.conversationId, message.senderRole, message.senderUserId ?? null, message.body, message.createdAt],
  );

  return message;
}

async function updateConversation(conversationId: string, patch: Partial<Pick<SupportConversationRow, "status" | "assigned_admin_id" | "last_message_at" | "waiting_since" | "first_notice_sent_at" | "second_notice_sent_at" | "updated_at">>): Promise<void> {
  await ensureSupportTables();

  const current = await readConversationRow(conversationId);
  if (!current) {
    return;
  }

  const hasPatch = <K extends keyof typeof patch>(key: K): boolean => Object.prototype.hasOwnProperty.call(patch, key);

  const nextStatus = hasPatch("status") ? patch.status ?? current.status : current.status;
  const nextAssignedAdminId = hasPatch("assigned_admin_id") ? patch.assigned_admin_id ?? null : current.assignedAdminId ?? null;
  const nextLastMessageAt = hasPatch("last_message_at") ? patch.last_message_at ?? current.lastMessageAt : current.lastMessageAt;
  const nextWaitingSince = hasPatch("waiting_since") ? patch.waiting_since ?? null : current.waitingSince ?? null;
  const nextFirstNoticeSentAt = hasPatch("first_notice_sent_at") ? patch.first_notice_sent_at ?? null : current.firstNoticeSentAt ?? null;
  const nextSecondNoticeSentAt = hasPatch("second_notice_sent_at") ? patch.second_notice_sent_at ?? null : current.secondNoticeSentAt ?? null;
  const nextUpdatedAt = hasPatch("updated_at") ? patch.updated_at ?? new Date().toISOString() : new Date().toISOString();

  await execute(
    `update support_conversations
     set status = $2,
         assigned_admin_id = $3,
         last_message_at = $4::timestamptz,
         waiting_since = $5::timestamptz,
         first_notice_sent_at = $6::timestamptz,
         second_notice_sent_at = $7::timestamptz,
         updated_at = $8::timestamptz
     where id = $1`,
    [
      conversationId,
      nextStatus,
      nextAssignedAdminId,
      nextLastMessageAt,
      nextWaitingSince,
      nextFirstNoticeSentAt,
      nextSecondNoticeSentAt,
      nextUpdatedAt,
    ],
  );
}

async function seedDelayNotices(conversation: SupportConversation): Promise<void> {
  if (conversation.status !== "waiting_admin" || !conversation.waitingSince) {
    return;
  }

  const elapsed = Date.now() - new Date(conversation.waitingSince).getTime();
  const notices: Array<{ threshold: number; marker?: string; message: string }> = [
    {
      threshold: 60_000,
      marker: conversation.firstNoticeSentAt,
      message: "Customer care is taking a little longer than usual. Your message is still in the live chat queue.",
    },
    {
      threshold: 120_000,
      marker: conversation.secondNoticeSentAt,
      message: "We have not forgotten you. Support is still on the way and will reply as soon as someone is available.",
    },
  ];

  let nextFirstNotice = conversation.firstNoticeSentAt;
  let nextSecondNotice = conversation.secondNoticeSentAt;

  for (const notice of notices) {
    if (elapsed < notice.threshold || notice.marker) {
      continue;
    }

    const inserted = await insertMessage({
      conversationId: conversation.id,
      senderRole: "system",
      body: notice.message,
    });

    if (notice.threshold === 60_000) {
      nextFirstNotice = inserted.createdAt;
    } else {
      nextSecondNotice = inserted.createdAt;
    }
  }

  if (nextFirstNotice !== conversation.firstNoticeSentAt || nextSecondNotice !== conversation.secondNoticeSentAt) {
    await updateConversation(conversation.id, {
      first_notice_sent_at: nextFirstNotice,
      second_notice_sent_at: nextSecondNotice,
      updated_at: new Date().toISOString(),
    });
  }
}

async function buildConversationView(conversation: SupportConversation): Promise<SupportConversationView> {
  const [messages, user, profile] = await Promise.all([
    readMessages(conversation.id),
    getUserById(conversation.userId),
    getProfileByUserId(conversation.userId),
  ]);

  return { conversation, messages, user, profile };
}

export async function getSupportConversationById(conversationId: string): Promise<SupportConversation | null> {
  return readConversationRow(conversationId);
}

export async function getSupportConversationView(conversationId: string): Promise<SupportConversationView | null> {
  const conversation = await readConversationRow(conversationId);
  if (!conversation) {
    return null;
  }

  await seedDelayNotices(conversation);
  const refreshed = await readConversationRow(conversationId);
  if (!refreshed) {
    return null;
  }

  return buildConversationView(refreshed);
}

export async function getLatestSupportConversationForUser(userId: string): Promise<SupportConversation | null> {
  return readLatestActiveConversationForUser(userId);
}

export async function getSupportConversationViewForUser(userId: string): Promise<SupportConversationView | null> {
  const conversation = await readLatestActiveConversationForUser(userId);
  if (!conversation) {
    return null;
  }

  await seedDelayNotices(conversation);
  const refreshed = await readConversationRow(conversation.id);
  if (!refreshed) {
    return null;
  }

  return buildConversationView(refreshed);
}

export async function getSupportConversationSummariesForAdmin(): Promise<SupportConversationSummary[]> {
  await ensureSupportTables();
  const result = await query<SupportConversationRow>(`select * from support_conversations order by updated_at desc`);

  const summaries = await Promise.all(
    result.rows.map(async (row) => {
      const conversation = mapConversationRow(row);
      await seedDelayNotices(conversation);
      const refreshed = await readConversationRow(conversation.id);

      if (!refreshed) {
        return null;
      }

      const messages = await readMessages(refreshed.id);
      const [user, profile] = await Promise.all([getUserById(refreshed.userId), getProfileByUserId(refreshed.userId)]);

      return {
        conversation: refreshed,
        messages,
        user,
        profile,
        lastMessage: messages[messages.length - 1] ?? null,
      } satisfies SupportConversationSummary;
    }),
  );

  const filteredSummaries: SupportConversationSummary[] = [];
  for (const summary of summaries) {
    if (summary) {
      filteredSummaries.push(summary);
    }
  }

  return filteredSummaries;
}

export async function getSupportConversationSummariesForUser(userId: string): Promise<SupportConversationSummary[]> {
  await ensureSupportTables();
  const result = await query<SupportConversationRow>(`select * from support_conversations where user_id = $1 order by updated_at desc`, [userId]);

  const summaries = await Promise.all(
    result.rows.map(async (row) => {
      const conversation = mapConversationRow(row);
      await seedDelayNotices(conversation);
      const refreshed = await readConversationRow(conversation.id);

      if (!refreshed) {
        return null;
      }

      const messages = await readMessages(refreshed.id);
      return {
        conversation: refreshed,
        messages,
        lastMessage: messages[messages.length - 1] ?? null,
      } satisfies SupportConversationSummary;
    }),
  );

  const filteredSummaries: SupportConversationSummary[] = [];
  for (const summary of summaries) {
    if (summary) {
      filteredSummaries.push(summary);
    }
  }

  return filteredSummaries;
}

export async function createOrResumeSupportConversation(input: {
  userId: string;
  subject?: string;
  message: string;
}): Promise<SupportConversationView> {
  await ensureSupportTables();

  const message = normalizeText(input.message);
  if (!message) {
    throw new Error("Message is required.");
  }

  const subject = normalizeText(input.subject || "Live chat support");
  const existing = await readLatestActiveConversationForUser(input.userId);

  if (!existing) {
    const now = new Date().toISOString();
    const conversationId = makeId("sc");
    const initialConversation: SupportConversation = {
      id: conversationId,
      userId: input.userId,
      subject,
      status: "waiting_admin",
      lastMessageAt: now,
      waitingSince: now,
      createdAt: now,
      updatedAt: now,
    };

    await query(
      `insert into support_conversations (
        id, user_id, subject, status, assigned_admin_id, last_message_at, waiting_since,
        first_notice_sent_at, second_notice_sent_at, created_at, updated_at
      ) values ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8::timestamptz, $9::timestamptz, $10::timestamptz, $11::timestamptz)`,
      [
        initialConversation.id,
        initialConversation.userId,
        initialConversation.subject,
        initialConversation.status,
        null,
        initialConversation.lastMessageAt,
        initialConversation.waitingSince,
        null,
        null,
        initialConversation.createdAt,
        initialConversation.updatedAt,
      ],
    );

    await insertMessage({ conversationId, senderRole: "user", senderUserId: input.userId, body: message });
    return getSupportConversationView(conversationId).then((view) => {
      if (!view) {
        throw new Error("Unable to create support conversation.");
      }

      return view;
    });
  }

  await addSupportMessage({ conversationId: existing.id, senderRole: "user", senderUserId: input.userId, body: message });
  const view = await getSupportConversationView(existing.id);
  if (!view) {
    throw new Error("Unable to load support conversation.");
  }

  return view;
}

export async function addSupportMessage(input: {
  conversationId: string;
  senderRole: SupportMessageSender;
  senderUserId?: string;
  body: string;
  assignedAdminId?: string;
}): Promise<SupportMessage> {
  const body = normalizeText(input.body);
  if (!body) {
    throw new Error("Message is required.");
  }

  const message = await insertMessage({
    conversationId: input.conversationId,
    senderRole: input.senderRole,
    senderUserId: input.senderUserId,
    body,
  });

  const now = new Date().toISOString();

  if (input.senderRole === "user") {
    await updateConversation(input.conversationId, {
      status: "waiting_admin",
      last_message_at: now,
      waiting_since: now,
      first_notice_sent_at: null,
      second_notice_sent_at: null,
      updated_at: now,
    });
  } else if (input.senderRole === "admin") {
    await updateConversation(input.conversationId, {
      status: "waiting_user",
      assigned_admin_id: input.assignedAdminId,
      last_message_at: now,
      updated_at: now,
    });
  } else {
    await updateConversation(input.conversationId, {
      last_message_at: now,
      updated_at: now,
    });
  }

  return message;
}

export async function closeSupportConversation(conversationId: string): Promise<void> {
  await updateConversation(conversationId, { status: "closed", updated_at: new Date().toISOString() });
}
