"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

// Mirrors the server rule in the `before` hook in src/lib/auth.ts.
const NAME_MAX = 100;

type Status = { kind: "saved" } | { kind: "error"; message: string } | null;

function validate(name: string) {
  if (!name.trim()) return "Enter your name.";
  if (name.trim().length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer.`;
  return undefined;
}

export function NameForm({ name: initialName }: { name: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialName);
  const [name, setName] = useState(initialName);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const input = useRef<HTMLInputElement>(null);

  const error = touched ? validate(name) : undefined;
  const dirty = name.trim() !== saved;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    if (validate(name)) {
      input.current?.focus();
      return;
    }
    if (!dirty || pending) return;

    const next = name.trim();
    setPending(true);
    setStatus(null);
    let failed: { status: number; message?: string } | null = null;
    try {
      ({ error: failed } = await authClient.updateUser({ name: next }));
    } catch {
      failed = { status: 0 };
    }
    setPending(false);

    if (failed) {
      setStatus({
        kind: "error",
        message:
          failed.status === 0
            ? "We couldn't reach Atelier. Check your connection and try again."
            : failed.status === 401
              ? "Your session has expired. Please sign in again."
              : failed.status === 429
                ? "Too many attempts. Please wait a minute and try again."
                : "We couldn't save your details. Please try again.",
      });
      return;
    }
    setSaved(next);
    setName(next);
    setTouched(false);
    setStatus({ kind: "saved" });
    // Refresh server components (the layout greeting reads the session).
    router.refresh();
  }

  const messageId = "name-message";

  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-busy={pending}>
      <label htmlFor="name" className="title-xs text-muted">
        Name
      </label>
      <input
        ref={input}
        id="name"
        name="name"
        autoComplete="name"
        value={name}
        disabled={pending}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        className="field"
        onChange={(e) => {
          setName(e.target.value);
          setStatus(null);
        }}
        onBlur={() => setTouched(true)}
      />
      {error && (
        <p id={messageId} className="mt-2 text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button type="submit" disabled={pending || !dirty} className="btn btn-primary">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {dirty && !pending && (
          <button
            type="button"
            className="link-muted"
            onClick={() => {
              setName(saved);
              setTouched(false);
              setStatus(null);
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div role="status" className="mt-4">
        {status?.kind === "saved" && <p className="text-success">Your details have been saved.</p>}
      </div>
      <div role="alert">
        {status?.kind === "error" && <p className="mt-4 text-danger">{status.message}</p>}
      </div>
    </form>
  );
}
