"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToBag } from "@/app/bag/actions";
import { notifyBagChange } from "@/components/bag/bag-count";
import { bagErrorMessage } from "@/lib/bag";
import { stockState, totalStock, type Product } from "@/lib/catalog";
import { StockIndicator } from "./stock-indicator";

type Status =
  | { kind: "idle" }
  | { kind: "needs-size" }
  | { kind: "added" }
  | { kind: "error"; message: string };

// Size selection, live stock state and add-to-bag. Stock shown here comes from
// the (up to 60s old) prerender; `addToBag` re-checks live stock on the server.
export function PurchasePanel({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  const selected = product.sizes?.find((s) => s.label === size);
  const quantity = selected ? selected.stock : totalStock(product);
  const soldOut = stockState(totalStock(product)) === "sold_out";
  const selectedSoldOut = selected ? selected.stock === 0 : false;

  const add = () => {
    if (product.sizes && !selected) {
      setStatus({ kind: "needs-size" });
      return;
    }
    if (pending) return;
    startTransition(async () => {
      try {
        const result = await addToBag({ slug: product.slug, size: selected?.label ?? null });
        if (result.ok) {
          setStatus({ kind: "added" });
          notifyBagChange();
        } else {
          setStatus({ kind: "error", message: bagErrorMessage(result) });
        }
      } catch {
        setStatus({
          kind: "error",
          message: "We couldn't reach Atelier. Check your connection and try again.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {product.sizes && (
        <div className="relative">
          <Link
            href="/client-services/size-guide"
            className="link absolute top-0 right-0"
          >
            Size guide
          </Link>
          <fieldset>
            <legend className="title-xs mb-3">
              Size{selected ? `: ${selected.label}` : ""}
            </legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {product.sizes.map((s) => {
                const out = s.stock === 0;
                return (
                  <label
                    key={s.label}
                    className={`relative flex h-12 cursor-pointer items-center justify-center border border-line bg-paper transition-colors duration-300 ease-luxe has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline has-focus-visible:outline-offset-2 ${
                      out ? "text-muted line-through" : "hover:border-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={s.label}
                      checked={size === s.label}
                      onChange={() => {
                        setSize(s.label);
                        setStatus({ kind: "idle" });
                      }}
                      className="sr-only"
                    />
                    <span>{s.label}</span>
                    {out && <span className="sr-only">, sold out</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}

      <div aria-live="polite">
        {status.kind === "needs-size" ? (
          <p className="text-danger">Please select a size.</p>
        ) : product.sizes && !selected && !soldOut ? (
          <p className="text-muted">Select a size to check availability.</p>
        ) : (
          <StockIndicator quantity={quantity} />
        )}
      </div>

      <div className="space-y-3">
        {soldOut || selectedSoldOut ? (
          <>
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled
            >
              Sold out
            </button>
            <Link
              href="/client-services"
              className="btn btn-secondary btn-block"
            >
              Contact a client advisor
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary btn-block"
              aria-disabled={pending || undefined}
              onClick={add}
            >
              {pending ? "Adding…" : status.kind === "added" ? "Added to bag" : "Add to bag"}
            </button>
            {status.kind === "added" ? (
              <Link href="/bag" className="btn btn-secondary btn-block">
                View bag
              </Link>
            ) : (
              <Link href="/appointments" className="btn btn-secondary btn-block">
                Book an appointment
              </Link>
            )}
          </>
        )}
      </div>

      <div role="status">
        {status.kind === "added" && (
          <p className="text-muted">
            {product.name}
            {selected ? `, size ${selected.label},` : ""} has been added to your
            bag.
          </p>
        )}
      </div>
      <div role="alert">
        {status.kind === "error" && <p className="text-danger">{status.message}</p>}
      </div>
    </div>
  );
}
