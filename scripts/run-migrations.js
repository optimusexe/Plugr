#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required to run migrations.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    await client.query(`create table if not exists users (
      id text primary key,
      full_name text not null,
      email text not null unique,
      password_hash text not null,
      verified boolean not null default false,
      is_admin boolean not null default false,
      verification_code text null,
      verification_code_expires_at timestamptz null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`);

    await client.query(`create table if not exists interactions (
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
    )`);

    await client.query(`create table if not exists reviews (
      id text primary key,
      interaction_id text not null unique,
      provider_id text not null,
      provider_user_id text not null,
      consumer_id text not null,
      rating integer not null,
      comment text null,
      confidence_weight numeric not null,
      created_at timestamptz not null default now()
    )`);

    await client.query(`create table if not exists notifications (
      id text primary key,
      user_id text not null,
      title text not null,
      message text not null,
      action_url text null,
      type text not null default 'system',
      read_at timestamptz null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`);

    await client.query(`create table if not exists profiles (
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
    )`);

    // Indexes
    try {
      await client.query("create index if not exists profiles_mode_idx on profiles(mode)");
      await client.query("create index if not exists profiles_verification_idx on profiles(verification_status)");
      await client.query("create index if not exists profiles_updated_at_idx on profiles(updated_at desc)");

      // Attempt trigram indexes; ignore if not supported
      try {
        await client.query("create extension if not exists pg_trgm");
        await client.query("create index if not exists profiles_fullname_trgm on profiles using gin (full_name gin_trgm_ops)");
        await client.query("create index if not exists profiles_primaryskill_trgm on profiles using gin (primary_skill gin_trgm_ops)");
        await client.query("create index if not exists profiles_search_tsv on profiles using gin (to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(primary_skill,'')))");
      } catch (e) {
        console.warn('pg_trgm not available or failed to create trigram indexes:', e.message || e);
      }
    } catch (e) {
      console.warn('Index creation warning:', e.message || e);
    }

    console.log('Migrations complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
