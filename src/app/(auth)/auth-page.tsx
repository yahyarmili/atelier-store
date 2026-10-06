import { redirect } from "next/navigation";
import { getSession, safeNext } from "@/lib/session";
import { AuthForm } from "./auth-form";

const copy = {
  "sign-in": { eyebrow: "Welcome back", title: "Sign in" },
  "sign-up": { eyebrow: "Join Atelier", title: "Create an account" },
} as const;

export async function AuthPage({
  mode,
  searchParams,
}: {
  mode: keyof typeof copy;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext((await searchParams).next);
  // Already signed in: skip the form.
  if (await getSession()) redirect(next);

  return (
    <section aria-labelledby="auth-title" className="container-page py-section">
      <div className="mx-auto max-w-sm">
        <p className="title-xs mb-2 text-muted">{copy[mode].eyebrow}</p>
        <h1 id="auth-title" className="title-l mb-10">
          {copy[mode].title}
        </h1>
        <AuthForm mode={mode} next={next} />
      </div>
    </section>
  );
}
