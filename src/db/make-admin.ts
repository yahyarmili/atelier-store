// Grants the admin role to an existing user. There is no UI for this.
// Usage: npm run auth:make-admin -- someone@example.com
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { user } from "./schema";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run auth:make-admin -- <email>");

  const rows = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id });

  if (rows.length === 0) throw new Error(`No user with email ${email}. Sign up first.`);
  console.log(`${email} is now an admin.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
