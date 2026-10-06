import type { Metadata } from "next";
import { getCatalogCounts } from "@/lib/products";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

// Every admin page and admin server action calls requireAdmin() itself —
// a layout check alone doesn't protect nested segments or actions.
export default async function AdminPage() {
  const { user } = await requireAdmin("/admin");
  const counts = await getCatalogCounts();

  return (
    <section aria-labelledby="admin-title" className="container-page py-section">
      <p className="title-xs mb-2 text-muted">Admin · {user.email}</p>
      <h1 id="admin-title" className="title-l mb-10">
        Dashboard
      </h1>

      <dl className="grid-layout hairline-t">
        <div className="col-span-2 py-6">
          <dt className="text-muted">Products</dt>
          <dd className="title-m tabular-nums">{counts.products}</dd>
        </div>
        <div className="col-span-2 py-6">
          <dt className="text-muted">Categories</dt>
          <dd className="title-m tabular-nums">{counts.categories}</dd>
        </div>
      </dl>
    </section>
  );
}
