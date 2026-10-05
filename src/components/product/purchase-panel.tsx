"use client";

import Link from "next/link";
import { useState } from "react";
import { stockState, totalStock, type Product } from "@/lib/catalog";
import { StockIndicator } from "./stock-indicator";

type Status = "idle" | "needs-size" | "added";

// Size selection, live stock state and add-to-bag.
// UI only — the bag isn't implemented yet, so "add" just confirms locally.
export function PurchasePanel({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const selected = product.sizes?.find((s) => s.label === size);
  const quantity = selected ? selected.stock : totalStock(product);
  const soldOut = stockState(totalStock(product)) === "sold_out";
  const selectedSoldOut = selected ? selected.stock === 0 : false;

  const addToBag = () => {
    if (product.sizes && !selected) {
      setStatus("needs-size");
      return;
    }
    setStatus("added");
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
                        setStatus("idle");
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
        {status === "needs-size" ? (
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
              onClick={addToBag}
            >
              {status === "added" ? "Added to bag" : "Add to bag"}
            </button>
            <Link href="/appointments" className="btn btn-secondary btn-block">
              Book an appointment
            </Link>
          </>
        )}
      </div>

      {status === "added" && (
        <p role="status" className="text-muted">
          {product.name}
          {selected ? `, size ${selected.label},` : ""} has been added to your
          bag.
        </p>
      )}
    </div>
  );
}
