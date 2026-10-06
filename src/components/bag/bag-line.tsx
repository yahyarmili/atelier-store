"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { removeFromBag, setBagQuantity } from "@/app/bag/actions";
import { bagErrorMessage, type BagItem } from "@/lib/bag";
import { formatPrice, stockLabel } from "@/lib/catalog";
import { notifyBagChange } from "./bag-count";

// One bag line. Both forms post to Server Actions, so they work without JS
// (the quantity form shows an Update button in that case); the action's
// response re-renders /bag with fresh prices and stock.

const notice: Record<BagItem["status"], (item: BagItem) => string | null> = {
  ok: () => null,
  reduced: (item) => `Quantity reduced — ${stockLabel(item.stock).toLowerCase()}.`,
  sold_out: () => "Sold out. This item isn't included in your subtotal.",
  unavailable: () => "No longer available in this size.",
};

export function BagLine({ item }: { item: BagItem }) {
  const [result, updateQuantity, updating] = useActionState(setBagQuantity, null);
  const [, remove, removing] = useActionState(removeFromBag, null);

  useEffect(() => {
    if (result?.ok) notifyBagChange();
  }, [result]);

  const purchasable = item.status === "ok" || item.status === "reduced";
  const href = `/products/${item.slug}`;
  const message = notice[item.status](item);
  const lineId = `bag-${item.productId}-${item.size ?? "one"}`.replace(/[^\w-]/g, "_");
  const key = (
    <>
      <input type="hidden" name="productId" value={item.productId} />
      <input type="hidden" name="size" value={item.size ?? ""} />
    </>
  );

  return (
    <li
      aria-busy={updating || removing}
      className={`hairline flex gap-4 py-6 transition-opacity duration-300 ease-luxe sm:gap-6 ${
        updating || removing ? "opacity-50" : ""
      }`}
    >
      <Link href={href} className="media aspect-[4/5] w-24 shrink-0 sm:w-32" tabIndex={-1}>
        <Image src={item.image.src} alt={item.image.alt} fill sizes="128px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h2 className="font-normal">
              <Link href={href} className="link-quiet">
                {item.name}
              </Link>
            </h2>
            {item.size && <p className="text-muted">Size {item.size}</p>}
            <p className="price text-muted">{formatPrice(item.unitPriceCents)}</p>
          </div>
          {purchasable && (
            <p className="price shrink-0">{formatPrice(item.lineTotalCents)}</p>
          )}
        </div>

        {message && <p className={item.status === "reduced" ? "text-danger" : "text-muted"}>{message}</p>}

        <div className="mt-auto flex items-end justify-between gap-4">
          {purchasable ? (
            <form action={updateQuantity} className="flex items-end gap-3">
              {key}
              <div className="flex w-16 flex-col">
                <label htmlFor={`${lineId}-qty`} className="title-xs text-muted">
                  Qty<span className="sr-only">, {item.name}</span>
                </label>
                <select
                  id={`${lineId}-qty`}
                  name="quantity"
                  defaultValue={item.purchasableQuantity}
                  key={item.purchasableQuantity}
                  disabled={updating}
                  className="field tabular-nums"
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                >
                  {Array.from({ length: item.maxQuantity }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <noscript>
                <button type="submit" className="link">
                  Update
                </button>
              </noscript>
            </form>
          ) : (
            <span />
          )}

          <form action={remove}>
            {key}
            <button
              type="submit"
              disabled={removing}
              aria-label={`Remove ${item.name}${item.size ? `, size ${item.size}` : ""}`}
              className="link-muted"
            >
              Remove
            </button>
          </form>
        </div>

        <div role="alert">
          {result && !result.ok && <p className="text-danger">{bagErrorMessage(result)}</p>}
        </div>
      </div>
    </li>
  );
}
