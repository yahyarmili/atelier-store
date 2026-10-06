"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Sign-out is a plain form action so it works without JS. Sign-in and sign-up
// go through the client (see auth-form.tsx) to stay behind rate limiting.
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
