"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

// Submits through the client so requests hit /api/auth/* and get Better
// Auth's rate limiting and origin checks (direct `auth.api` calls skip both).
export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signUp = mode === "sign-up";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);
    const { error } = signUp
      ? await authClient.signUp.email({ name: String(form.get("name") ?? "").trim(), email, password })
      : await authClient.signIn.email({ email, password });

    if (error) {
      setError(errorMessage(mode, error.status, error.code));
      setPending(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  const otherHref = `${signUp ? "/sign-in" : "/sign-up"}?next=${encodeURIComponent(next)}`;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {signUp && (
        <div>
          <label htmlFor="name" className="title-xs text-muted">
            Name
          </label>
          <input id="name" name="name" required maxLength={100} autoComplete="name" className="field" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="title-xs text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          className="field"
        />
      </div>
      <div>
        <label htmlFor="password" className="title-xs text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete={signUp ? "new-password" : "current-password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={signUp ? "password-hint" : undefined}
          className="field"
        />
        {signUp && (
          <p id="password-hint" className="caption mt-2 text-muted">
            At least 8 characters.
          </p>
        )}
      </div>

      <p role="alert" aria-live="polite" className="min-h-5 text-danger">
        {error}
      </p>

      <button type="submit" disabled={pending} className="btn btn-primary btn-block">
        {pending ? "Please wait…" : signUp ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-muted">
        {signUp ? "Already have an account? " : "New to Atelier? "}
        <Link href={otherHref} className="link">
          {signUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

function errorMessage(mode: Mode, status: number, code?: string) {
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (code === "PASSWORD_TOO_SHORT") return "Password must be at least 8 characters.";
  if (code === "PASSWORD_TOO_LONG") return "Password must be at most 128 characters.";
  if (code === "INVALID_EMAIL") return "Enter a valid email address.";
  if (mode === "sign-up") {
    return code?.startsWith("USER_ALREADY_EXISTS")
      ? "An account with this email already exists."
      : "We couldn't create your account. Please try again.";
  }
  return "Incorrect email or password.";
}
