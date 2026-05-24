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
