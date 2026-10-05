import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getNewArrivals } from "@/lib/products";

export async function NewArrivals() {
  const newArrivals = await getNewArrivals();

  return (
    <section aria-labelledby="new-arrivals-title" className="section">
      <div className="container-page mb-6 flex items-end justify-between gap-4 lg:mb-8">
        <div>
          <p className="title-xs mb-2 text-muted">This week</p>
          <h2 id="new-arrivals-title" className="title-m">
            New Arrivals
          </h2>
        </div>
        <Link href="/new-in" className="link shrink-0">
          View all
        </Link>
      </div>

      <ul className="product-grid">
        {newArrivals.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
