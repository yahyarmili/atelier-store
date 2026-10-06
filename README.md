# Atelier Store

Next.js 16 (App Router, TypeScript, Tailwind CSS v4) with Better Auth, Drizzle ORM and Neon Postgres.

## Setup

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Fill in `.env` (not `.env.local`; Next, drizzle-kit and the auth CLI all read `.env`):

- `DATABASE_URL` — Neon connection string (pooled)
- `BETTER_AUTH_SECRET` — `npx auth secret` or `openssl rand -base64 32`
- `BETTER_AUTH_URL` — app origin, e.g. `http://localhost:3000`

The catalog pages read from the database, so migrate and seed before running `dev` or `build`.

## Database & auth

```bash
npm run auth:generate   # write Better Auth tables into src/db/schema/auth.ts
npm run db:generate     # create SQL migrations in ./drizzle
npm run db:migrate      # apply migrations to Neon
npm run db:seed         # upsert the sample catalog (idempotent)
npm run db:push         # push schema directly (prototyping only, not on a real database)
npm run db:studio       # browse data on 127.0.0.1 (Docker: bash scripts/db-studio.sh)
```

After `auth:generate`, add `export * from "./auth"` to `src/db/schema/index.ts`, then run `db:generate` and `db:migrate`. Auth endpoints fail with "Missing tables" until this is done.

Drizzle Studio's SQL endpoint has no auth and accepts requests from any browser origin. Run it only on loopback, only while you use it, and preferably against a non-production Neon branch.

## Layout

```
src/
  app/api/auth/[...all]/route.ts   Better Auth route handler
  app/products/[slug]/page.tsx     Product detail page
  app/new-in/page.tsx              New arrivals listing
  app/globals.css                  Design system (Tailwind v4 tokens and utilities)
  components/                      Site chrome, home sections, product UI
  db/index.ts                      Drizzle client (Neon HTTP driver)
  db/schema/                       Drizzle schema (catalog.ts, re-exported from index.ts)
  db/seed.ts, db/seed-data.ts      Sample catalog seed
  lib/products.ts                  Server-only catalog queries
  lib/catalog.ts                   Catalog types, stock rules, editorial copy
  lib/auth.ts                      Better Auth server instance
  lib/auth-client.ts               Better Auth React client
drizzle/                           Versioned SQL migrations
drizzle.config.ts                  drizzle-kit config
```

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck` (runs `next typegen` first), plus the `db:*` and `auth:generate` scripts above. There is no test suite yet.
