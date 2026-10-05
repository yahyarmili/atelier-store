// Single schema entry point for the `db` client, the Better Auth adapter and
// drizzle-kit. `npm run auth:generate` writes the Better Auth tables to
// ./auth.ts — re-export it here once generated.
export * from "./catalog";
