"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons";

// UI only — not wired to a mailing list yet.
export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p role="status" className="py-4">
        Thank you. You are now subscribed to Atelier updates.
      </p>
    );
  }

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Email"
        className="field pr-10"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="btn-icon absolute right-0 bottom-0 -mr-2.5"
      >
        <ArrowRightIcon />
      </button>
    </form>
  );
}
