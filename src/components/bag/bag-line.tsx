"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { removeFromBag, setBagQuantity } from "@/app/bag/actions";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { StockIndicator } from "@/components/product/stock-indicator";
import { MAX_LINE_QUANTITY, bagErrorMessage, type BagItem } from "@/lib/bag";
import { formatPrice, stockLabel, stockState } from "@/lib/catalog";
import { notifyBagChange } from "./bag-count";

// One bag line. Both forms post to Server Actions, so they work without JS:
// the stepper buttons submit the target quantity as their own value. The
// action's response re-renders /bag with fresh prices and stock.

const badge: Partial<Record<BagItem["status"], string>> = {
  sold_out: "Sold out",
  unavailable: "Unavailable",
};

function statusNotice(item: BagItem) {
  switch (item.status) {
    case "reduced":
      return `Quantity reduced to ${item.maxQuantity} — ${stockLabel(item.stock).toLowerCase()}.`;
    case "sold_out":
      return "This item has sold out and isn't included in your subtotal.";
    case "unavailable":
      return "This size is no longer available and isn't included in your subtotal.";
    default:
      return null;
  }
}

export function BagLine({ item }: { item: BagItem }) {
  const [result, updateQuantity, updating] = useActionState(setBagQuantity, null);
  const [, remove, removing] = useActionState(removeFromBag, null);

  useEffect(() => {
    if (result?.ok) notifyBagChange();
  }, [result]);

  const purchasable = item.status === "ok" || item.status === "reduced";
  const quantity = item.purchasableQuantity;
  const atMax = purchasable && quantity >= item.maxQuantity;
  const href = `/products/${item.slug}`;
  const notice = statusNotice(item);
  const label = `${item.name}${item.size ? `, size ${item.size}` : ""}`;
  const busy = updating || removing;
  const key = (
    <>
      <input type="hidden" name="productId" value={item.productId} />
      <input type="hidden" name="size" value={item.size ?? ""} />
    </>
  );

  return (
    <li
      aria-busy={busy}
      className={`hairline flex gap-4 py-6 transition-opacity duration-300 ease-luxe sm:gap-6 ${
        busy ? "opacity-50" : ""
      }`}
    >
      <Link href={href} className="media aspect-[4/5] w-24 shrink-0 sm:w-32" tabIndex={-1}>
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="128px"
          className={purchasable ? "" : "opacity-50"}
        />
        {badge[item.status] && (
          <span className="caption absolute top-2 left-2 bg-paper/90 px-1.5 py-0.5">
            {badge[item.status]}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className={`min-w-0 space-y-1 ${purchasable ? "" : "text-muted"}`}>
            <h2 className="font-normal">
              <Link href={href} className="link-quiet">
                {item.name}
              </Link>
            </h2>
            {item.size && <p className="text-muted">Size {item.size}</p>}
            <p className="price text-muted">
              {formatPrice(item.unitPriceCents)}
              {quantity > 1 && <span className="sr-only"> each</span>}
            </p>
          </div>
          {purchasable && (
            <p className="price shrink-0">
              <span className="sr-only">Line total </span>
              {formatPrice(item.lineTotalCents)}
            </p>
          )}
        </div>

        {notice && (
          <p className={item.status === "reduced" ? "text-danger" : "text-muted"}>{notice}</p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          {purchasable ? (
            <div className="space-y-2">
              <form action={updateQuantity}>
                {key}
                <div
                  role="group"
                  aria-label={`Quantity, ${label}`}
                  className="inline-flex h-10 items-stretch border border-line"
                >
                  <button
                    type="submit"
                    name="quantity"
                    value={quantity - 1}
                    disabled={busy || quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex w-10 items-center justify-center transition-colors duration-300 ease-luxe hover:bg-subtle disabled:pointer-events-none disabled:text-muted/50"
                  >
                    <MinusIcon width={14} height={14} />
                  </button>
                  <output
                    aria-live="polite"
                    className="flex min-w-8 items-center justify-center tabular-nums"
                  >
                    {quantity}
                  </output>
                  <button
                    type="submit"
                    name="quantity"
                    value={quantity + 1}
                    disabled={busy || atMax}
                    aria-label="Increase quantity"
                    className="flex w-10 items-center justify-center transition-colors duration-300 ease-luxe hover:bg-subtle disabled:pointer-events-none disabled:text-muted/50"
                  >
                    <PlusIcon width={14} height={14} />
                  </button>
                </div>
              </form>
              {item.status === "ok" &&
                (stockState(item.stock) === "low_stock" ? (
                  <StockIndicator quantity={item.stock} />
                ) : (
                  atMax && <p className="text-muted">Limit of {MAX_LINE_QUANTITY} per item.</p>
                ))}
            </div>
          ) : (
            <span />
          )}

          <form action={remove}>
            {key}
            <button
              type="submit"
              disabled={busy}
              aria-label={`Remove ${label}`}
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
