import type { Metadata } from "next";
import Link from "next/link";
import { BagCountSync } from "@/components/bag/bag-count";
import { BagLine } from "@/components/bag/bag-line";
import { BagIcon } from "@/components/icons";
import { getBag } from "@/lib/bag-store";
import { formatPrice } from "@/lib/catalog";

// Dynamic (reads the bag cookie). Prices and stock are resolved from the
// database on every request; the cookie only holds product ids, sizes and
// quantities.

export const metadata: Metadata = {
  title: "Shopping bag",
  robots: { index: false },
};

function itemsLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export default async function BagPage() {
  const { items, subtotalCents, count } = await getBag();
  const changed = items.some((i) => i.status !== "ok");

  return (
    <section aria-labelledby="bag-title" className="container-page pt-6 pb-section lg:pt-10">
      <BagCountSync count={count} />
      <div className="mb-8 flex items-end justify-between gap-4 lg:mb-12">
        <h1 id="bag-title" className="title-l">
          Shopping bag
        </h1>
        {items.length > 0 && (
          <p className="shrink-0 text-muted tabular-nums">{itemsLabel(count)}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="hairline-t flex flex-col items-center py-20 text-center lg:py-28">
          <BagIcon width={32} height={32} className="mb-6 text-muted" />
          <h2 className="title-s mb-2">Your bag is empty</h2>
          <p className="body mb-10 max-w-sm text-soft">
            Pieces you add to your bag will appear here.
          </p>
          <Link href="/new-in" className="btn btn-primary">
            Discover new arrivals
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-8">
            {changed && (
              <p role="status" className="mb-6 bg-subtle px-4 py-3">
                Some items in your bag have changed since you added them. Quantities and
                totals below reflect current availability.
              </p>
            )}
            <ul className="hairline-t">
              {items.map((item) => (
                <BagLine key={`${item.productId}:${item.size ?? ""}`} item={item} />
              ))}
            </ul>
          </div>

          <aside
            aria-labelledby="bag-summary"
            className="mt-10 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:col-span-4 lg:mt-0"
          >
            <h2 id="bag-summary" className="title-xs mb-4">
              Order summary
            </h2>
            <dl className="hairline-t">
              <div className="hairline flex justify-between gap-4 py-4">
                <dt>
                  Subtotal <span className="text-muted">({itemsLabel(count)})</span>
                </dt>
                <dd className="price">{formatPrice(subtotalCents)}</dd>
              </div>
              <div className="hairline flex justify-between gap-4 py-4 text-muted">
                <dt>Shipping</dt>
                <dd>Complimentary</dd>
              </div>
            </dl>
            <p className="mt-4 mb-6 text-muted">Taxes are calculated at checkout.</p>
            <button type="button" className="btn btn-primary btn-block" disabled>
              Checkout — coming soon
            </button>
            <Link href="/new-in" className="link-muted mt-4 block text-center">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
