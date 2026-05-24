[pg] slow execute 2149ms {
  sql: '\n' +
    '    create table if not exists users (\n' +
    '      id text primary key,\n' +
    '      full_name text not null,\n' +
    '      email text not null unique,\n' +
    '      password_hash text not null,\n' +
    '      verified boolean not null default false,\n' +
    '      is_admin boolean not null default false,\n' +
    '      verification_code text null,\n' +
    '      verification_code_expires_at timestamptz null,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 2149,
  params: []
}
[pg] slow execute 2223ms {
  sql: '\n' +
    '    create table if not exists reviews (\n' +
    '      id text primary key,\n' +
    '      interaction_id text not null unique,\n' +
    '      provider_id text not null,\n' +
    '      provider_user_id text not null,\n' +
    '      consumer_id text not null,\n' +
    '      rating integer not null,\n' +
    '      comment text null,\n' +
    '      confidence_weight numeric not null,\n' +
    '      created_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 2223,
  params: []
}
[pg] slow execute 2228ms {
  sql: '\n' +
    '    create table if not exists interactions (\n' +
    '      id text primary key,\n' +
    '      provider_id text not null,\n' +
    '      provider_user_id text not null,\n' +
    '      consumer_id text not null,\n' +
    '      contact_channel text not null,\n' +
    '      status text not null,\n' +
    '      consumer_confirmed boolean not null default false,\n' +
    '      provider_confirmed boolean not null default false,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 2228,
  params: []
}
[pg] slow execute 2096ms {
  sql: '\n' +
    '    create table if not exists users (\n' +
    '      id text primary key,\n' +
    '      full_name text not null,\n' +
    '      email text not null unique,\n' +
    '      password_hash text not null,\n' +
    '      verified boolean not null default false,\n' +
    '      is_admin boolean not null default false,\n' +
    '      verification_code text null,\n' +
    '      verification_code_expires_at timestamptz null,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 2096,
  params: []
}
[pg] slow execute 2276ms {
  sql: '\n' +
    '    create table if not exists users (\n' +
    '      id text primary key,\n' +
    '      full_name text not null,\n' +
    '      email text not null unique,\n' +
    '      password_hash text not null,\n' +
    '      verified boolean not null default false,\n' +
    '      is_admin boolean not null default false,\n' +
    '      verification_code text null,\n' +
    '      verification_code_expires_at timestamptz null,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 2276,
  params: []
}
[pg] slow execute 1449ms {
  sql: '\n' +
    '    create table if not exists users (\n' +
    '      id text primary key,\n' +
    '      full_name text not null,\n' +
    '      email text not null unique,\n' +
    '      password_hash text not null,\n' +
    '      verified boolean not null default false,\n' +
    '      is_admin boolean not null default false,\n' +
    '      verification_code text null,\n' +
    '      verification_code_expires_at timestamptz null,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 1449,
  params: []
}
[pg] slow execute 2382ms {
  sql: '\n' +
    '        create table if not exists profiles (\n' +
    '          id text primary key,\n' +
    '          user_id text not null unique,\n' +
    '          profile_image text null,\n' +
    '          products jsonb null,\n' +
    '          full_name text not null,\n' +
    '          faculty text not null,\n' +
    '          department text not null,\n' +
    '          level text not null,\n' +
    '          phone text not null,\n' +
    '          email text null,\n' +
    '          location_text text not null,\n' +
    '          map_link text null,\n' +
    '          primary_skill text null,\n' +
    '          bio text null,\n' +
    '          mode text not null,\n' +
    "          verification_status text not null default 'pending',\n" +
    '          credibility numeric not null default 0,\n' +
    '          created_at timestamptz not null default now(),\n' +
    '          updated_at timestamptz not null default now()\n' +
    '        );\n' +
    '      ',
  duration: 2382,
  params: []
}
[pg] slow execute 1784ms {
  sql: '\n' +
    '    create table if not exists interactions (\n' +
    '      id text primary key,\n' +
    '      provider_id text not null,\n' +
    '      provider_user_id text not null,\n' +
    '      consumer_id text not null,\n' +
    '      contact_channel text not null,\n' +
    '      status text not null,\n' +
    '      consumer_confirmed boolean not null default false,\n' +
    '      provider_confirmed boolean not null default false,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 1784,
  params: []
}
[pg] slow execute 224ms {
  sql: 'alter table users add column if not exists is_admin boolean not null default false',
  duration: 224,
  params: []
}
[pg] slow execute 1908ms {
  sql: '\n' +
    '    create table if not exists reviews (\n' +
    '      id text primary key,\n' +
    '      interaction_id text not null unique,\n' +
    '      provider_id text not null,\n' +
    '      provider_user_id text not null,\n' +
    '      consumer_id text not null,\n' +
    '      rating integer not null,\n' +
    '      comment text null,\n' +
    '      confidence_weight numeric not null,\n' +
    '      created_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 1908,
  params: []
}
[pg] slow execute 1849ms {
  sql: '\n' +
    '    create table if not exists users (\n' +
    '      id text primary key,\n' +
    '      full_name text not null,\n' +
    '      email text not null unique,\n' +
    '      password_hash text not null,\n' +
    '      verified boolean not null default false,\n' +
    '      is_admin boolean not null default false,\n' +
    '      verification_code text null,\n' +
    '      verification_code_expires_at timestamptz null,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 1849,
  params: []
}
[pg] query 196ms { sql: 'select * from reviews order by created_at asc', duration: 196 }
[pg] slow execute 1970ms {
  sql: '\n' +
    '    create table if not exists users (\n' +
    '      id text primary key,\n' +
    '      full_name text not null,\n' +
    '      email text not null unique,\n' +
    '      password_hash text not null,\n' +
    '      verified boolean not null default false,\n' +
    '      is_admin boolean not null default false,\n' +
    '      verification_code text null,\n' +
    '      verification_code_expires_at timestamptz null,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 1970,
  params: []
}
[pg] slow query 327ms {
  sql: 'select * from interactions order by created_at asc',
  duration: 327,
  params: []
}
[pg] slow execute 317ms {
  sql: 'alter table users add column if not exists is_admin boolean not null default false',
  duration: 317,
  params: []
}
[pg] slow execute 391ms {
  sql: 'alter table users add column if not exists is_admin boolean not null default false',
  duration: 391,
  params: []
}
[pg] slow execute 415ms {
  sql: 'alter table users add column if not exists is_admin boolean not null default false',
  duration: 415,
  params: []
}
[pg] slow query 455ms {
  sql: 'select * from interactions order by created_at asc',
  duration: 455,
  params: []
}
[pg] slow execute 497ms {
  sql: 'create index if not exists profiles_mode_idx on profiles(mode)',
  duration: 497,
  params: []
}
[pg] slow query 467ms {
  sql: 'select * from users order by created_at asc',
  duration: 467,
  params: []
}
[pg] slow query 535ms {
  sql: 'select * from reviews order by created_at asc',
  duration: 535,
  params: []
}
[pg] slow execute 554ms {
  sql: 'alter table users add column if not exists is_admin boolean not null default false',
  duration: 554,
  params: []
}
[pg] slow execute 521ms {
  sql: 'alter table users add column if not exists is_admin boolean not null default false',
  duration: 521,
  params: []
}
[pg] slow query 400ms {
  sql: 'select * from users where id = $1 limit 1',
  duration: 400,
  params: [ 'u_hfvimqbf' ]
}
[pg] slow query 691ms {
  sql: 'select * from users order by created_at asc',
  duration: 691,
  params: []
}
[pg] slow query 723ms {
  sql: 'select * from users where id = $1 limit 1',
  duration: 723,
  params: [ 'u_hfvimqbf' ]
}
[pg] slow execute 708ms {
  sql: 'create index if not exists profiles_verification_idx on profiles(verification_status)',
  duration: 708,
  params: []
}
[pg] slow query 600ms {
  sql: 'select * from users order by created_at asc',
  duration: 600,
  params: []
}
[pg] slow query 610ms {
  sql: 'select * from users order by created_at asc',
  duration: 610,
  params: []
}
profiles index creation warning: error: operator class "gin_trgm_ops" does not exist for access method "gin"
    at async execute (src\lib\azure\postgres.ts:82:7)
    at async (src\lib\profile-store.ts:142:11)
  80 |     try {
  81 |       const start = Date.now();
> 82 |       await activePool.query(text, params);
     |       ^
  83 |       const duration = Date.now() - start;
  84 |       try {
  85 |         if (duration > 200) { {
  length: 131,
  severity: 'ERROR',
  code: '42704',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'indexcmds.c',
  line: '2306',
  routine: 'ResolveOpClass'
}
[pg] query 164ms { sql: 'select count(*) from profiles', duration: 164 }
[pg] query 166ms { sql: 'select count(*) from profiles', duration: 166 }
[pg] query 156ms {
  sql: "select count(*) from profiles where mode in ('provider','both')",
  duration: 156
}
[pg] query 188ms {
  sql: "select count(*) from profiles where mode in ('provider','both')",
  duration: 188
}
[pg] query 174ms {
  sql: "select count(*) from profiles where mode in ('provider','both') and verification_status = 'verified'",
  duration: 174
}
[pg] query 178ms {
  sql: "select count(*) from profiles where mode in ('provider','both') and verification_status = 'verified'",
  duration: 178
}
[pg] query 183ms {
  sql: "select distinct lower(trim(primary_skill)) as primary_skill from profiles where mode in ('provider','both') and primary_skill is not null",
  duration: 183
}
[pg] query 187ms {
  sql: "select distinct lower(trim(primary_skill)) as primary_skill from profiles where mode in ('provider','both') and primary_skill is not null",
  duration: 187
}
⨯ Error: Query read timeout
    at async query (src\lib\azure\postgres.ts:48:22)
    at async readProfilesFromDb (src\lib\profile-store.ts:171:18)
    at async getAdminOverview (src\lib\admin-store.ts:65:61)
    at async AdminStatsPage (src\app\admin\stats\page.tsx:11:39)
  46 |     try {
  47 |       const start = Date.now();
> 48 |       const result = await activePool.query<T>(text, params);
     |                      ^
  49 |       const duration = Date.now() - start;
  50 |       try {
  51 |         if (duration > 200) { {
  digest: '162650711'
}
 GET /admin/stats 200 in 35.0s (next.js: 459ms, application-code: 34.5s)
⨯ Error: Query read timeout
    at async query (src\lib\azure\postgres.ts:48:22)
    at async readProfilesFromDb (src\lib\profile-store.ts:171:18)
    at async getAdminOverview (src\lib\admin-store.ts:65:61)
    at async AdminStatsPage (src\app\admin\stats\page.tsx:11:39)
  46 |     try {
  47 |       const start = Date.now();
> 48 |       const result = await activePool.query<T>(text, params);
     |                      ^
  49 |       const duration = Date.now() - start;
  50 |       try {
  51 |         if (duration > 200) { {
  digest: '162650711'
}
 GET /admin/stats 200 in 35.6s (next.js: 119ms, application-code: 35.5s)
[browser] Uncaught Error: Query read timeout
    at query (src\lib\azure\postgres.ts:48:22)
    at readProfilesFromDb (src\lib\profile-store.ts:171:18)
    at Promise.all (<anonymous>:1:20)
    at getAdminOverview (src\lib\admin-store.ts:65:61)
    at Promise.all (<anonymous>:1:20)
    at AdminStatsPage (src\app\admin\stats\page.tsx:11:39)
  46 |     try {
  47 |       const start = Date.now();
> 48 |       const result = await activePool.query<T>(text, params);
     |                      ^
  49 |       const duration = Date.now() - start;
  50 |       try {
  51 |         if (duration > 200) {
⚠ Unsupported metadata viewport is configured in metadata export in /discover. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 GET /discover 200 in 792ms (next.js: 200ms, application-code: 591ms)
[pg] slow execute 4221ms {
  sql: '\n' +
    '        create table if not exists profiles (\n' +
    '          id text primary key,\n' +
    '          user_id text not null unique,\n' +
    '          profile_image text null,\n' +
    '          products jsonb null,\n' +
    '          full_name text not null,\n' +
    '          faculty text not null,\n' +
    '          department text not null,\n' +
    '          level text not null,\n' +
    '          phone text not null,\n' +
    '          email text null,\n' +
    '          location_text text not null,\n' +
    '          map_link text null,\n' +
    '          primary_skill text null,\n' +
    '          bio text null,\n' +
    '          mode text not null,\n' +
    "          verification_status text not null default 'pending',\n" +
    '          credibility numeric not null default 0,\n' +
    '          created_at timestamptz not null default now(),\n' +
    '          updated_at timestamptz not null default now()\n' +
    '        );\n' +
    '      ',
  duration: 4221,
  params: []
}
[pg] slow execute 305ms {
  sql: 'create index if not exists profiles_mode_idx on profiles(mode)',
  duration: 305,
  params: []
}
[pg] slow execute 4527ms {
  sql: '\n' +
    '    create table if not exists users (\n' +
    '      id text primary key,\n' +
    '      full_name text not null,\n' +
    '      email text not null unique,\n' +
    '      password_hash text not null,\n' +
    '      verified boolean not null default false,\n' +
    '      is_admin boolean not null default false,\n' +
    '      verification_code text null,\n' +
    '      verification_code_expires_at timestamptz null,\n' +
    '      created_at timestamptz not null default now(),\n' +
    '      updated_at timestamptz not null default now()\n' +
    '    )\n' +
    '  ',
  duration: 4527,
  params: []
}
[pg] slow execute 4402ms {
  sql: '\n' +
    '        create table if not exists profiles (\n' +
    '          id text primary key,\n' +
    '          user_id text not null unique,\n' +
    '          profile_image text null,\n' +
    '          products jsonb null,\n' +
    '          full_name text not null,\n' +
    '          faculty text not null,\n' +
    '          department text not null,\n' +
    '          level text not null,\n' +
    '          phone text not null,\n' +
    '          email text null,\n' +
    '          location_text text not null,\n' +
    '          map_link text null,\n' +
    '          primary_skill text null,\n' +
    '          bio text null,\n' +
    '          mode text not null,\n' +
    "          verification_status text not null default 'pending',\n" +
    '          credibility numeric not null default 0,\n' +
    '          created_at timestamptz not null default now(),\n' +
    '          updated_at timestamptz not null default now()\n' +
    '        );\n' +
    '      ',
  duration: 4402,
  params: []
}
[pg] execute 166ms { duration: 166 }
[pg] execute 164ms { duration: 164 }
[pg] slow execute 4454ms {
  sql: '\n' +
    '      create table if not exists notifications (\n' +
    '        id text primary key,\n' +
    '        user_id text not null,\n' +
    '        title text not null,\n' +
    '        message text not null,\n' +
    '        action_url text null,\n' +
    "        type text not null default 'system',\n" +
    '        read_at timestamptz null,\n' +
    '        created_at timestamptz not null default now(),\n' +
    '        updated_at timestamptz not null default now()\n' +
    '      )\n' +
    '    ',
  duration: 4454,
  params: []
}
[pg] execute 179ms { duration: 179 }
profiles index creation warning: error: operator class "gin_trgm_ops" does not exist for access method "gin"
    at async execute (src\lib\azure\postgres.ts:82:7)
    at async (src\lib\profile-store.ts:142:11)
    at async ensureProfilesTable (src\lib\profile-store.ts:166:3)
    at async findProfileRowByUserId (src\lib\profile-store.ts:185:3)
    at async GET (src\app\api\profile\route.ts:31:29)
  80 |     try {
  81 |       const start = Date.now();
> 82 |       await activePool.query(text, params);
     |       ^
  83 |       const duration = Date.now() - start;
  84 |       try {
  85 |         if (duration > 200) { {
  length: 131,
  severity: 'ERROR',
  code: '42704',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'indexcmds.c',
  line: '2306',
  routine: 'ResolveOpClass'
}
[pg] slow execute 533ms {
  sql: 'create index if not exists profiles_verification_idx on profiles(verification_status)',
  duration: 533,
  params: []
}
[pg] slow execute 532ms {
  sql: 'alter table notifications add column if not exists action_url text null',
  duration: 532,
  params: []
}
[pg] slow query 530ms {
  sql: 'select * from users where id = $1 limit 1',
  duration: 530,
  params: [ 'u_hfvimqbf' ]
}
profiles index creation warning: error: operator class "gin_trgm_ops" does not exist for access method "gin"
    at async execute (src\lib\azure\postgres.ts:82:7)
    at async (src\lib\profile-store.ts:142:11)
    at async ensureProfilesTable (src\lib\profile-store.ts:166:3)
    at async findProviders (src\lib\profile-store.ts:382:3)
    at async GET (src\app\api\discover\providers\route.ts:28:20)
  80 |     try {
  81 |       const start = Date.now();
> 82 |       await activePool.query(text, params);
     |       ^
  83 |       const duration = Date.now() - start;
  84 |       try {
  85 |         if (duration > 200) { {
  length: 131,
  severity: 'ERROR',
  code: '42704',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'indexcmds.c',
  line: '2306',
  routine: 'ResolveOpClass'
}
[pg] slow execute 1018ms {
  sql: "alter table notifications add column if not exists type text not null default 'system'",
  duration: 1018,
  params: []
}
[pg] slow execute 735ms {
  sql: 'alter table notifications add column if not exists read_at timestamptz null',
  duration: 735,
  params: []
}
[pg] slow execute 292ms {
  sql: 'alter table notifications add column if not exists updated_at timestamptz not null default now()',
  duration: 292,
  params: []
}
[pg] slow execute 216ms {
  sql: 'create index if not exists notifications_user_created_idx on notifications (user_id, created_at desc)',
  duration: 216,
  params: []
}
[pg] slow execute 249ms {
  sql: 'create index if not exists notifications_user_unread_idx on notifications (user_id, read_at)',
  duration: 249,
  params: []
}
[pg] query 159ms {
  sql: 'select * from notifications where user_id = $1 order by created_at desc limit $2',
  duration: 159
}
[pg] slow query 2866ms {
  sql: 'select count(*)::text as count from notifications where user_id = $1 and read_at is null',
  duration: 2866,
  params: [ 'u_hfvimqbf' ]
}
 GET /api/notifications?userId=u_hfvimqbf 200 in 10.5s (next.js: 100ms, application-code: 10.4s)
[pg] slow query 5847ms {
  sql: 'select count(*)::text as count from notifications where user_id = $1 and read_at is null',
  duration: 5847,
  params: [ 'u_hfvimqbf' ]
}
[pg] slow query 6336ms {
  sql: 'select * from notifications where user_id = $1 order by created_at desc limit $2',
  duration: 6336,
  params: [ 'u_hfvimqbf', 20 ]
}
 GET /api/notifications?userId=u_hfvimqbf 200 in 6.4s (next.js: 8ms, application-code: 6.4s)
/api/discover/providers error Error: Query read timeout
    at async query (src\lib\azure\postgres.ts:48:22)
    at async findProviders (src\lib\profile-store.ts:434:16)
    at async GET (src\app\api\discover\providers\route.ts:28:20)
  46 |     try {
  47 |       const start = Date.now();
> 48 |       const result = await activePool.query<T>(text, params);
     |                      ^
  49 |       const duration = Date.now() - start;
  50 |       try {
  51 |         if (duration > 200) {
 GET /api/discover/providers?limit=20 500 in 39.3s (next.js: 349ms, application-code: 39.0s)
[api/profile/GET] err_mpjsinve_m26fim Error: Query read timeout
    at async query (src\lib\azure\postgres.ts:48:22)
    at async findProfileRowByUserId (src\lib\profile-store.ts:186:18)
    at async GET (src\app\api\profile\route.ts:31:29)
  46 |     try {
  47 |       const start = Date.now();
> 48 |       const result = await activePool.query<T>(text, params);
     |                      ^
  49 |       const duration = Date.now() - start;
  50 |       try {
  51 |         if (duration > 200) {
 GET /api/profile?userId=u_hfvimqbf 500 in 40s (next.js: 208ms, application-code: 40s)
[pg] execute 179ms { duration: 179 }
[pg] slow execute 256ms {
  sql: 'alter table users add column if not exists is_admin boolean not null default false',
  duration: 256,
  params: []
}
[pg] slow query 202ms {
  sql: 'select * from users where id = $1 limit 1',
  duration: 202,
  params: [ 'u_hfvimqbf' ]
}
 GET /api/auth/me?userId=u_hfvimqbf 200 in 816ms (next.js: 147ms, application-code: 669ms)
[pg] query 190ms {
  sql: 'select * from notifications where user_id = $1 order by created_at desc limit $2',
  duration: 190
}
[pg] query 192ms {
  sql: 'select count(*)::text as count from notifications where user_id = $1 and read_at is null',
  duration: 192
}
 GET /api/notifications?userId=u_hfvimqbf 200 in 208ms (next.js: 4ms, application-code: 203ms)
[pg] query 190ms {
  sql: 'select * from notifications where user_id = $1 order by created_at desc limit $2',
  duration: 190
}
[pg] query 192ms {
  sql: 'select count(*)::text as count from notifications where user_id = $1 and read_at is null',
  duration: 192
}
 GET /api/notifications?userId=u_hfvimqbf 200 in 207ms (next.js: 5ms, application-code: 203ms)
