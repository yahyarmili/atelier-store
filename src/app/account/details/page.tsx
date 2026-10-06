import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { NameForm } from "./name-form";

export const metadata: Metadata = {
  title: "Account details",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export default async function AccountDetailsPage() {
  const { user } = await requireUser("/account/details");

  return (
    <div className="space-y-14">
      {/* The active nav item already labels the page visually. */}
      <h1 className="sr-only">Account details</h1>

      <section aria-labelledby="details-name" className="max-w-md">
        <h2 id="details-name" className="sr-only">
          Name
        </h2>
        <NameForm name={user.name} />
      </section>

      <section aria-labelledby="details-sign-in" className="max-w-md">
        <h2 id="details-sign-in" className="title-xs mb-4 text-muted">
          Sign-in details
        </h2>
        <dl className="hairline-t">
          <div className="hairline flex justify-between gap-4 py-4">
            <dt className="shrink-0 text-muted">Email</dt>
            <dd className="min-w-0 break-all text-right">{user.email}</dd>
          </div>
          <div className="hairline flex justify-between gap-4 py-4">
            <dt className="shrink-0 text-muted">Member since</dt>
            <dd className="text-right">
              <time dateTime={user.createdAt.toISOString()}>{memberSince.format(user.createdAt)}</time>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-muted">
          To change your email address, please{" "}
          <Link href="/client-services" className="link text-ink">
            contact client services
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
