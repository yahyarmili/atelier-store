"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { signOutAction } from "@/app/(auth)/actions";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/details", label: "Account details" },
];

// Horizontal tabs on mobile, a vertical list from lg up.
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="hairline lg:border-b-0">
      <ul className="scroll-row [--row-gap:2rem] lg:flex-col lg:[--row-gap:1rem]">
        {links.map((link) => {
          const current = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`title-xs link-muted block py-4 lg:py-0 ${current ? "max-lg:border-b max-lg:border-ink" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <li className="lg:mt-4 lg:border-t lg:pt-8">
          <form action={signOutAction}>
            <SignOutButton />
          </form>
        </li>
      </ul>
    </nav>
  );
}

function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="title-xs link-muted py-4 lg:py-0">
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
