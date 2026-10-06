import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default async function AccountOverviewPage() {
  const { user } = await requireUser("/account");

  return (
    <div className="space-y-14">
      <h1 className="sr-only">Account overview</h1>

      <section aria-labelledby="overview-details">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="overview-details" className="title-s">
            Account details
          </h2>
          <Link href="/account/details" className="link">
            Edit
          </Link>
        </div>
        <dl className="hairline-t">
          <div className="hairline flex justify-between gap-4 py-4">
            <dt className="shrink-0 text-muted">Name</dt>
            <dd className="min-w-0 break-words text-right">{user.name}</dd>
          </div>
          <div className="hairline flex justify-between gap-4 py-4">
            <dt className="shrink-0 text-muted">Email</dt>
            <dd className="min-w-0 break-all text-right">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="overview-help">
        <h2 id="overview-help" className="title-s mb-4">
          Client services
        </h2>
        <p className="body mb-6 max-w-md text-soft">
          Our advisors can help with product questions, care advice and appointments.
        </p>
        <Link href="/client-services" className="btn btn-secondary">
          Contact client services
        </Link>
      </section>
    </div>
  );
}
