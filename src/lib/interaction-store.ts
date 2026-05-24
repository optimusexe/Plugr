import { execute, query } from "@/lib/azure/postgres";
import type { ContactChannel, ServiceInteraction } from "@/lib/types";

function makeId(): string {
  return `i_${Math.random().toString(36).slice(2, 10)}`;
}

type InteractionRow = {
  id: string;
  provider_id: string;
  provider_user_id: string;
  consumer_id: string;
  contact_channel: ContactChannel;
  status: ServiceInteraction["status"];
  consumer_confirmed: boolean;
  provider_confirmed: boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

function mapInteractionRow(row: InteractionRow): ServiceInteraction {
  return {
    id: row.id,
    providerId: row.provider_id,
    providerUserId: row.provider_user_id,
    consumerId: row.consumer_id,
    contactChannel: row.contact_channel,
    status: row.status,
    consumerConfirmed: row.consumer_confirmed,
    providerConfirmed: row.provider_confirmed,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function ensureInteractionsTable(): Promise<void> {
  await execute(`
    create table if not exists interactions (
      id text primary key,
      provider_id text not null,
      provider_user_id text not null,
      consumer_id text not null,
      contact_channel text not null,
      status text not null,
      consumer_confirmed boolean not null default false,
      provider_confirmed boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
}

async function getInteractionsFromDb(): Promise<ServiceInteraction[]> {
  await ensureInteractionsTable();
  const result = await query<InteractionRow>(`select * from interactions order by created_at asc`);
  return result.rows.map(mapInteractionRow);
}

export async function getInteractions(): Promise<ServiceInteraction[]> {
  return getInteractionsFromDb();
}

async function getInteractionByIdFromDb(id: string): Promise<ServiceInteraction | null> {
  await ensureInteractionsTable();
  const result = await query<InteractionRow>(`select * from interactions where id = $1 limit 1`, [id]);
  return result.rows[0] ? mapInteractionRow(result.rows[0]) : null;
}

async function insertInteractionIntoDb(interaction: ServiceInteraction): Promise<ServiceInteraction> {
  await ensureInteractionsTable();
  const result = await query<InteractionRow>(
    `insert into interactions (
      id, provider_id, provider_user_id, consumer_id, contact_channel, status,
      consumer_confirmed, provider_confirmed, created_at, updated_at
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz) returning *`,
    [
      interaction.id,
      interaction.providerId,
      interaction.providerUserId,
      interaction.consumerId,
      interaction.contactChannel,
      interaction.status,
      interaction.consumerConfirmed,
      interaction.providerConfirmed,
      interaction.createdAt,
      interaction.updatedAt,
    ],
  );

  return mapInteractionRow(result.rows[0]);
}

async function updateInteractionIntoDb(interaction: ServiceInteraction): Promise<ServiceInteraction> {
  await ensureInteractionsTable();
  const result = await query<InteractionRow>(
    `update interactions
     set provider_id = $2,
         provider_user_id = $3,
         consumer_id = $4,
         contact_channel = $5,
         status = $6,
         consumer_confirmed = $7,
         provider_confirmed = $8,
         updated_at = $9::timestamptz
     where id = $1
     returning *`,
    [
      interaction.id,
      interaction.providerId,
      interaction.providerUserId,
      interaction.consumerId,
      interaction.contactChannel,
      interaction.status,
      interaction.consumerConfirmed,
      interaction.providerConfirmed,
      interaction.updatedAt,
    ],
  );

  return mapInteractionRow(result.rows[0]);
}

export async function createInteraction(input: {
  providerId: string;
  providerUserId: string;
  consumerId: string;
  contactChannel: ContactChannel;
}): Promise<ServiceInteraction> {
  const now = new Date().toISOString();

  const interaction: ServiceInteraction = {
    id: makeId(),
    providerId: input.providerId,
    providerUserId: input.providerUserId,
    consumerId: input.consumerId,
    contactChannel: input.contactChannel,
    status: "pending",
    consumerConfirmed: false,
    providerConfirmed: false,
    createdAt: now,
    updatedAt: now,
  };

  return insertInteractionIntoDb(interaction);
}

export async function getInteractionsByProvider(providerId: string): Promise<ServiceInteraction[]> {
  const interactions = await getInteractionsFromDb();
  return interactions.filter((entry) => entry.providerId === providerId);
}

export async function getConsumerInteractionsForProvider(consumerId: string, providerId: string): Promise<ServiceInteraction[]> {
  const interactions = await getInteractionsFromDb();
  return interactions.filter((entry) => entry.consumerId === consumerId && entry.providerId === providerId);
}

export async function getInteractionById(id: string): Promise<ServiceInteraction | null> {
  return getInteractionByIdFromDb(id);
}

export async function confirmInteraction(input: {
  interactionId: string;
  actor: "consumer" | "provider";
  completed: boolean;
}): Promise<ServiceInteraction | null> {
  const current = await getInteractionByIdFromDb(input.interactionId);

  if (!current) {
    return null;
  }
  const consumerConfirmed =
    input.actor === "consumer" ? input.completed : current.consumerConfirmed;
  const providerConfirmed =
    input.actor === "provider" ? input.completed : current.providerConfirmed;

  let status: ServiceInteraction["status"] = "pending";
  if (consumerConfirmed && providerConfirmed) {
    status = "mutually_confirmed";
  } else if (consumerConfirmed) {
    status = "consumer_confirmed";
  } else if (providerConfirmed) {
    status = "provider_confirmed";
  } else if (input.actor === "consumer" && !input.completed) {
    status = "consumer_declined";
  } else if (input.actor === "provider" && !input.completed) {
    status = "provider_declined";
  }

  const updated: ServiceInteraction = {
    ...current,
    consumerConfirmed,
    providerConfirmed,
    status,
    updatedAt: new Date().toISOString(),
  };

  return updateInteractionIntoDb(updated);
}

export async function countProviderCompletionSignals(providerId: string): Promise<{ consumerConfirmed: number; mutual: number }> {
  const interactions = await getInteractionsByProvider(providerId);
  const consumerConfirmed = interactions.filter((entry) => entry.consumerConfirmed).length;
  const mutual = interactions.filter((entry) => entry.consumerConfirmed && entry.providerConfirmed).length;
  return { consumerConfirmed, mutual };
}
