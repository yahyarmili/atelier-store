import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

// The authorization boundary. Pages and server actions check auth through
// these helpers — never `auth.api.getSession` directly, and never only in a
// layout or in proxy.ts (which is an optimistic cookie check).

/** The current session (DB-backed), deduplicated per request. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/** Signed-in user or a redirect to sign-in that returns to `next`. */
export async function requireUser(next = "/account") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session;
}

/** Admin user; anyone else gets a 404 so the route's existence isn't revealed. */
export async function requireAdmin(next = "/admin") {
  const session = await requireUser(next);
  if (session.user.role !== "admin") notFound();
  return session;
}

/** A same-origin path to redirect to after auth, or `fallback`. Blocks open redirects. */
export function safeNext(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
