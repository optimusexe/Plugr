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

    // Add deactivated_until to users if missing
    try {
      await client.query('alter table users add column if not exists deactivated_until timestamptz null');
    } catch (e) {
      console.warn('Failed to add deactivated_until column:', e.message || e);
    }

    // Audit logs
    await client.query(`create table if not exists audit_logs (
      id text primary key,
      user_id text null,
      action text not null,
      details jsonb null,
      created_at timestamptz not null default now()
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

    // Add new ranking columns if missing
    try {
      await client.query("alter table profiles add column if not exists last_active_at timestamptz null");
      await client.query("alter table profiles add column if not exists view_count integer not null default 0");
      await client.query("alter table profiles add column if not exists contact_count integer not null default 0");

      // Backfill last_active_at from updated_at for existing rows
      await client.query("update profiles set last_active_at = updated_at where last_active_at is null");

      // Backfill view_count from analytics_events
      await client.query(`
        update profiles p set view_count = coalesce((
          select count(*) from analytics_events ae
          where ae.provider_id = p.id and ae.event_type = 'profile_view'
        ), 0)
        where p.view_count = 0
      `);

      // Backfill contact_count from analytics_events
      await client.query(`
        update profiles p set contact_count = coalesce((
          select count(*) from analytics_events ae
          where ae.provider_id = p.id and ae.event_type = 'contact_click'
        ), 0)
        where p.contact_count = 0
      `);

      // Index for new columns
      await client.query("create index if not exists profiles_last_active_at_idx on profiles(last_active_at desc)");
    } catch (e) {
      console.warn('Failed to add ranking columns:', e.message || e);
    }

    // Indexes
    try {
      await client.query("create index if not exists profiles_mode_idx on profiles(mode)");
      await client.query("create index if not exists profiles_verification_idx on profiles(verification_status)");
      await client.query("create index if not exists profiles_updated_at_idx on profiles(updated_at desc)");
      // Composite index for discover - supports both old and new scoring
      await client.query("create index if not exists profiles_discover_default_idx on profiles(verification_status desc, credibility desc, updated_at desc, id desc) where mode in ('provider','both')");

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

    // Analytics events table
    await client.query(`create table if not exists analytics_events (
      id text primary key,
      provider_id text not null,
      event_type text not null,
      metadata jsonb null,
      visitor_id text null,
      created_at timestamptz not null default now()
    )`);

    // Analytics indexes
    try {
      await client.query("create index if not exists analytics_events_provider_idx on analytics_events(provider_id, event_type, created_at desc)");
      await client.query("create index if not exists analytics_events_created_at_idx on analytics_events(created_at desc)");
    } catch (e) {
      console.warn('Analytics index creation warning:', e.message || e);
    }

    // Migrate base64 images to Azure Blob Storage
    try {
      const { BlobServiceClient } = require('@azure/storage-blob');
      const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
      
      if (AZURE_STORAGE_CONNECTION_STRING) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const profileContainer = blobServiceClient.getContainerClient('plugr-profile-images');
        const productContainer = blobServiceClient.getContainerClient('plugr-product-images');
        await profileContainer.createIfNotExists();
        await productContainer.createIfNotExists();

        async function uploadBase64ToBlob(dataUrl, userId, type) {
          if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
          
          const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!matches) return dataUrl;

          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const blobName = `${userId}/migrated-${Date.now()}.${ext}`;
          const containerName = type === 'profile' ? profileContainer : productContainer;
          const blockBlobClient = containerName.getBlockBlobClient(blobName);
          
          await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: `image/${matches[1]}` }
          });
          
          return blockBlobClient.url;
        }

        // Migrate profile images
        const profileResult = await client.query(
          "SELECT id, user_id, profile_image FROM profiles WHERE profile_image LIKE 'data:image%'"
        );
        console.log(`Found ${profileResult.rows.length} profiles with base64 images to migrate.`);
        
        for (const row of profileResult.rows) {
          const url = await uploadBase64ToBlob(row.profile_image, row.user_id, 'profile');
          await client.query('UPDATE profiles SET profile_image = $1 WHERE id = $2', [url, row.id]);
          console.log(`Migrated profile image for user ${row.user_id}`);
        }

        // Migrate product images
        const productResult = await client.query(
          "SELECT id, user_id, products FROM profiles WHERE products::text LIKE '%data:image%'"
        );
        console.log(`Found ${productResult.rows.length} profiles with base64 product images to migrate.`);
        
        for (const row of productResult.rows) {
          const products = row.products || [];
          let updated = false;
          
          for (let i = 0; i < products.length; i++) {
            if (products[i].image && products[i].image.startsWith('data:')) {
              products[i].image = await uploadBase64ToBlob(products[i].image, row.user_id, 'product');
              updated = true;
            }
          }
          
          if (updated) {
            await client.query('UPDATE profiles SET products = $1 WHERE id = $2', [JSON.stringify(products), row.id]);
            console.log(`Migrated product images for user ${row.user_id}`);
          }
        }

        console.log('Base64 image migration complete.');
      } else {
        console.log('Skipping base64 image migration: AZURE_STORAGE_CONNECTION_STRING not set.');
      }
    } catch (e) {
      console.warn('Base64 image migration failed:', e.message || e);
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
