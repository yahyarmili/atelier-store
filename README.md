# Atelier Store

Next.js 16 (App Router, TypeScript, Tailwind CSS v4) with Better Auth, Drizzle ORM and Neon Postgres.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Fill in `.env`:

- `DATABASE_URL` — Neon connection string (pooled)
- `BETTER_AUTH_SECRET` — `npx auth secret` or `openssl rand -base64 32`
- `BETTER_AUTH_URL` — app origin, e.g. `http://localhost:3000`

## Database & auth

```bash
npm run auth:generate   # write Better Auth tables into src/db/schema.ts
npm run db:generate     # create SQL migrations in ./drizzle
npm run db:migrate      # apply migrations to Neon
npm run db:push         # or push schema directly (prototyping)
npm run db:studio       # browse data
```

## Layout

```
src/
  app/api/auth/[...all]/route.ts   Better Auth route handler
  db/index.ts                      Drizzle client (Neon HTTP driver)
  db/schema.ts                     Drizzle schema
  lib/auth.ts                      Better Auth server instance
  lib/auth-client.ts               Better Auth React client
drizzle.config.ts                  drizzle-kit config
```

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck`, plus the `db:*` and `auth:generate` scripts above.
