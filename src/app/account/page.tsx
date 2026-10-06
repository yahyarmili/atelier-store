import type { Metadata } from "next";
import { signOutAction } from "@/app/(auth)/actions";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default async function AccountPage() {
  const { user } = await requireUser("/account");

  return (
    <section aria-labelledby="account-title" className="container-page py-section">
      <div className="mx-auto max-w-sm">
        <p className="title-xs mb-2 text-muted">My account</p>
        <h1 id="account-title" className="title-l mb-10">
          Welcome, {user.name}
        </h1>

        <dl className="hairline-t mb-10">
          <div className="hairline flex justify-between gap-4 py-4">
            <dt className="text-muted">Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="hairline flex justify-between gap-4 py-4">
            <dt className="text-muted">Email</dt>
            <dd className="truncate">{user.email}</dd>
          </div>
        </dl>

        <form action={signOutAction}>
          <button type="submit" className="btn btn-secondary btn-block">
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
