# Plugr

A student marketplace webapp (Next.js + TypeScript). This README covers developer setup, important migration steps, and the new account deactivation/deletion behavior.

## Getting started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run the migration script (required before first run against a fresh DB):

```bash
npm run migrate
```

Run tests:

```bash
npx jest --runInBand --colors
```

## Required environment variables

- `DATABASE_URL` — Postgres connection string used for migrations and runtime.
- Azure messaging keys (optional): `AZURE_COMMUNICATION_CONNECTION_STRING`, `AZURE_COMMUNICATION_EMAIL_SENDER`, `AZURE_COMMUNICATION_SMS_FROM`

## Database migrations

This project includes a simple migration runner at `scripts/run-migrations.js` (invoked via `npm run migrate`). The migration will:

- Create core tables (`users`, `profiles`, `notifications`, etc.) if missing.
- Ensure the `deactivated_until` column exists on `users`.
- Create an `audit_logs` table used for recording critical account actions.

Run this script in CI or as part of your deployment process to ensure schema compatibility. Avoid relying on runtime `ALTER TABLE` in production without a migration plan.

## Account deactivation & deletion (important)

- Deactivation: users can temporarily deactivate their account until a chosen date. The server enforces that `until` is a future timestamp and cannot exceed 365 days from now.
- Reactivation: users must re-authenticate (provide their password) to reactivate early.
- Deletion: permanent removal requires password confirmation and will delete user-owned rows across tables (notifications, verification checks, support conversations/messages, reviews, interactions, profiles, users). Deletion also writes audit logs and attempts to email the user a confirmation.

Notes:
- Re-auth is required for destructive actions to reduce accidental account loss.
- Audit logs are written to the `audit_logs` table with `action` and optional `details`.

## APIs (quick reference)

- `POST /api/auth/account/deactivate` — body: `{ "until": "ISO timestamp" }` — sets a deactivation time.
- `DELETE /api/auth/account/deactivate` — body: `{ "password": "currentPassword" }` — reactivates the account (password required).
- `DELETE /api/auth/account` — body: `{ "confirmed": true, "password": "currentPassword" }` — permanently deletes the account (password required).

Responses use JSON `{ success: true }` on success or `{ error: "message" }` with appropriate HTTP status codes.

## CI / Release notes

- Ensure `npm run migrate` is executed as part of your deployment or CI workflow prior to application start against a new database.
- The `deactivated_until` column addition is idempotent; the migration script uses `IF NOT EXISTS` semantics.

## Testing

- Unit/integration tests are powered by Jest and `ts-jest`. Mocking is used for Postgres and messaging in the test suite.

## Security & operations

- Sensitive account actions require password confirmation (server-enforced). Logs of these actions are stored in `audit_logs` for compliance and debugging.
- Email notifications are sent via Azure Communication Services when configured.

## Where to look next

- Settings UI: `src/app/settings/page.tsx` — contains the account deactivation/reactivation and account deletion flows.
- Auth helpers and database logic: `src/lib/auth-store.ts`.
- Migration script: `scripts/run-migrations.js`.
- Audit helper: `src/lib/audit.ts`.

If you want, I can also add a short `MIGRATIONS.md` with rollout guidance for DBs with replicas or managed providers.
# Plugr

Plugr is a LASU student discovery and connection platform where students can showcase skills, get found quickly, and secure trusted gigs.

## Core Value

- Speed: search and connect with student providers quickly.
- Accessibility: one account can switch between provider and requester modes.
- Trust: profiles display faculty, level, credibility signals, and verification status.

## Current MVP Screens

- Home: value proposition, live metrics, and live provider preview.
- Discover: searchable provider directory with verified filter and direct contact actions.
- Register: working profile registration form and role-switch workflow.

## Core Workflows Implemented

- Profile registration API with validation and persistent storage.
- Provider discovery API with query filtering and verified-only filtering.
- Metrics API computed from real stored profiles.
- Role switching API to move between provider, requester, and both modes.

## Data Storage

- Azure Database for PostgreSQL is used when `DATABASE_URL` is set.
- Azure Blob Storage stores uploaded profile photos, product images, and verification ID images.
- Azure Communication Services delivers verification OTPs by email and SMS when configured.
- The JSON files in `src/data/` remain as a local fallback for development.

## Azure Setup

Set these environment variables in Vercel and local `.env` files:

- `DATABASE_URL` - Azure Database for PostgreSQL connection string.
- `POSTGRES_SSL=true` - enable SSL for Azure Postgres connections.
- `AZURE_STORAGE_CONNECTION_STRING` - Blob Storage connection string.
- `AZURE_STORAGE_CONTAINER` - default upload container name.
- `AZURE_COMMUNICATION_CONNECTION_STRING` - ACS connection string.
- `AZURE_COMMUNICATION_EMAIL_SENDER` - verified ACS email sender address.
- `AZURE_COMMUNICATION_SMS_FROM` - ACS SMS-enabled phone number.
- `PLUGR_COOKIE_SECRET` - session cookie secret for auth flows.

Recommended Azure resources:

1. Azure Database for PostgreSQL Flexible Server.
2. Azure Storage Account with a blob container for uploads.
3. Azure Communication Services resource with email and SMS enabled.

Deployment on Vercel:

1. Add the environment variables above in the Vercel project settings.
2. Keep Vercel as the app host.
3. Use Azure only for persistence, storage, and messaging.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates production build.
- `npm run start` runs the production server.
- `npm run lint` runs ESLint.

## Notes

- Verification status defaults to pending on registration.
- The app now uses Azure-backed persistence for auth, profiles, interactions, reviews, and verification when configured.
