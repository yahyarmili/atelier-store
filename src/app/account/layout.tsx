import { AccountNav } from "@/components/account/account-nav";
import { getSession } from "@/lib/session";

// Shared shell for /account/*. Not an auth boundary: every page under here
// calls requireUser() itself (layouts don't re-run on client navigation).
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const session = await getSession();

  return (
    <div className="container-page py-section">
      <header className="mb-8 lg:mb-14">
        <p className="title-xs mb-2 text-muted">My account</p>
        <p className="title-l break-words">{session ? `Welcome, ${session.user.name}` : "Welcome"}</p>
      </header>

      <div className="grid-layout gap-y-10">
        <div className="col-span-full lg:col-span-3">
          <AccountNav />
        </div>
        <div className="col-span-full lg:col-span-8 lg:col-start-5">{children}</div>
      </div>
    </div>
  );
}
