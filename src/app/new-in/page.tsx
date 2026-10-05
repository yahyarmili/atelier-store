import type { Metadata } from "next";
import Link from "next/link";
import { ServicesStrip } from "@/components/home/services-strip";
import { ProductCard } from "@/components/product/product-card";
import { getNewArrivals } from "@/lib/products";

// Catalog and stock come from the database; refresh the prerender every minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest pieces from the atelier: bags, shoes, jewelry and eyewear.",
};

export default async function NewInPage() {
  const newArrivals = await getNewArrivals();
  const count = newArrivals.length;

  return (
    <>
      <section aria-labelledby="new-in-title" className="pb-section">
        <div className="container-page pt-6 pb-8 lg:pt-10 lg:pb-12">
          <nav aria-label="Breadcrumb" className="mb-8 text-muted lg:mb-12">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="link-muted">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                New In
              </li>
            </ol>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="title-xs mb-2 text-muted">This week</p>
              <h1 id="new-in-title" className="title-l">
                New Arrivals
              </h1>
            </div>
            <p className="shrink-0 text-muted tabular-nums">
              {count} {count === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>

        {count > 0 ? (
          <ul className="product-grid">
            {newArrivals.map((product, i) => (
              <li key={product.slug}>
                <ProductCard product={product} preload={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="container-page flex flex-col items-center py-24 text-center">
            <p className="body mb-10 max-w-sm text-soft">
              The new season is on its way. Explore the collection in the meantime.
            </p>
            <Link href="/" className="btn btn-primary">
              Return to the homepage
            </Link>
          </div>
        )}
      </section>

      <ServicesStrip />
    </>
  );
}
