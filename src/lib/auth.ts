import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

const NAME_MAX_LENGTH = 100;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      // Granted only via `npm run auth:make-admin`; `input: false` keeps it
      // out of sign-up bodies. The DB enforces the values with a check constraint.
      role: {
        type: ["customer", "admin"],
        required: true,
        defaultValue: "customer",
        input: false,
      },
    },
  },
  // No cookieCache: every check reads the DB, so sign-out and role changes
  // take effect immediately.
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  // DB storage so limits hold across serverless instances.
  rateLimit: {
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  hooks: {
    // Better Auth doesn't bound `name`; enforce the same rule as the forms.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email" && ctx.path !== "/update-user") return;
      const name: unknown = ctx.body?.name;
      if (name === undefined && ctx.path === "/update-user") return;
      if (typeof name !== "string" || !name.trim() || name.trim().length > NAME_MAX_LENGTH) {
        throw new APIError("BAD_REQUEST", {
          code: "INVALID_NAME",
          message: `Name must be between 1 and ${NAME_MAX_LENGTH} characters.`,
        });
      }
    }),
  },
  advanced: {
    // Integer identity PKs, per the house table style.
    database: { generateId: "serial" },
  },
  // nextCookies must be the last plugin.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
