"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";
type FieldName = "name" | "email" | "password";
type Values = Record<FieldName, string>;
type FormError = { field?: FieldName; message: ReactNode };

// Mirrors the server limits in src/lib/auth.ts; Better Auth re-validates.
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const NAME_MAX = 100;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode: Mode, v: Values): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (mode === "sign-up") {
    if (!v.name.trim()) errors.name = "Enter your name.";
    else if (v.name.trim().length > NAME_MAX) errors.name = `Name must be ${NAME_MAX} characters or fewer.`;
  }
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Enter a valid email address, like name@example.com.";
  if (!v.password) errors.password = mode === "sign-up" ? "Create a password." : "Enter your password.";
  else if (mode === "sign-up" && v.password.length < PASSWORD_MIN)
    errors.password = `Password must be at least ${PASSWORD_MIN} characters.`;
  else if (v.password.length > PASSWORD_MAX)
    errors.password = `Password must be ${PASSWORD_MAX} characters or fewer.`;
  return errors;
}

// Submits through the client so requests hit /api/auth/* and get Better
// Auth's rate limiting and origin checks (direct `auth.api` calls skip both).
export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const signUp = mode === "sign-up";
  const fields: FieldName[] = signUp ? ["name", "email", "password"] : ["email", "password"];

  const [values, setValues] = useState<Values>({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const inputs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({});

  const errors = validate(mode, values);
  // Field errors appear after the field is left once (or on submit), then update live.
  const errorFor = (field: FieldName) =>
    (submitted || touched[field] ? errors[field] : undefined) ??
    (formError?.field === field ? formError.message : undefined);

  function update(field: FieldName, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setFormError(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setFormError(null);

    const firstInvalid = fields.find((f) => errors[f]);
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus();
      return;
    }

    setPending(true);
    const email = values.email.trim();
    let error: { status: number; code?: string } | null = null;
    try {
      ({ error } = signUp
        ? await authClient.signUp.email({ name: values.name.trim(), email, password: values.password })
        : await authClient.signIn.email({ email, password: values.password }));
    } catch {
      error = { status: 0 };
    }

    if (!error) {
      // Stay pending until the next page replaces this one.
      router.replace(next);
      router.refresh();
      return;
    }

    const failure = describeError(mode, error, next);
    setFormError(failure);
    setPending(false);
    if (failure.field === "password" && !signUp) {
      // Wrong credentials: keep the email, clear the password for a retry.
      setValues((v) => ({ ...v, password: "" }));
      setSubmitted(false);
      setTouched({});
    }
    requestAnimationFrame(() => inputs.current[failure.field ?? "email"]?.focus());
  }

  const switchHref = `${signUp ? "/sign-in" : "/sign-up"}?next=${encodeURIComponent(next)}`;
  const passwordHint = signUp ? `At least ${PASSWORD_MIN} characters.` : undefined;

  return (
    // method="post": a submit before hydration must not put the password in the URL.
    <form method="post" onSubmit={onSubmit} noValidate aria-busy={pending}>
      {/* Always rendered so screen readers announce errors inserted into it. */}
      <div role="alert">
        {formError && !formError.field && (
          <p className="mb-8 border border-danger px-4 py-3 text-danger">{formError.message}</p>
        )}
      </div>

      <fieldset disabled={pending} className="space-y-6">
        <legend className="sr-only">{signUp ? "Account details" : "Sign-in details"}</legend>
        {signUp && (
          <TextField
            ref={(el) => {
              inputs.current.name = el;
            }}
            id="name"
            label="Name"
            autoComplete="name"
            value={values.name}
            error={errorFor("name")}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
        )}
        <TextField
          ref={(el) => {
            inputs.current.email = el;
          }}
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.email}
          error={errorFor("email")}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        <TextField
          ref={(el) => {
            inputs.current.password = el;
          }}
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete={signUp ? "new-password" : "current-password"}
          value={values.password}
          error={errorFor("password")}
          hint={capsLock ? "Caps Lock is on." : passwordHint}
          className="pr-14"
          onChange={(e) => update("password", e.target.value)}
          onBlur={() => {
            setTouched((t) => ({ ...t, password: true }));
            setCapsLock(false);
          }}
          onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
          trailing={
            <button
              type="button"
              className="title-xs link-muted absolute right-0 bottom-0 py-3"
              aria-controls="password"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
              <span className="sr-only"> password</span>
            </button>
          }
        />
      </fieldset>

      <div className="mt-8 space-y-8">
        <button type="submit" disabled={pending} className="btn btn-primary btn-block">
          {pending ? (signUp ? "Creating account…" : "Signing in…") : signUp ? "Create account" : "Sign in"}
        </button>

        <p className="text-center text-muted">
          {signUp ? "Already have an account? " : "New to Atelier? "}
          <Link href={switchHref} className="link text-ink">
            {signUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </form>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: ReactNode;
  hint?: string;
  trailing?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

function TextField({ id, label, error, hint, trailing, className, ...input }: TextFieldProps) {
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div>
      <label htmlFor={id} className="title-xs text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={`field ${className ?? ""}`}
          {...input}
        />
        {trailing}
      </div>
      {message && (
        <p id={messageId} className={`mt-2 ${error ? "text-danger" : "text-muted"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

function describeError(
  mode: Mode,
  error: { status: number; code?: string },
  next: string,
): FormError {
  if (error.status === 0) return { message: "We couldn't reach Atelier. Check your connection and try again." };
  if (error.status === 429) return { message: "Too many attempts. Please wait a minute and try again." };
  if (error.code === "INVALID_NAME")
    return { field: "name", message: `Name must be ${NAME_MAX} characters or fewer.` };
  if (error.code === "INVALID_EMAIL") return { field: "email", message: "Enter a valid email address." };
  if (error.code === "PASSWORD_TOO_SHORT")
    return { field: "password", message: `Password must be at least ${PASSWORD_MIN} characters.` };
  if (error.code === "PASSWORD_TOO_LONG")
    return { field: "password", message: `Password must be ${PASSWORD_MAX} characters or fewer.` };
  if (mode === "sign-up") {
    if (error.code?.startsWith("USER_ALREADY_EXISTS"))
      return {
        field: "email",
        message: (
          <>
            An account with this email already exists.{" "}
            <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="link">
              Sign in instead
            </Link>
          </>
        ),
      };
    return { message: "We couldn't create your account. Please try again." };
  }
  if (error.status === 401) return { field: "password", message: "Incorrect email or password." };
  return { message: "We couldn't sign you in. Please try again." };
}
