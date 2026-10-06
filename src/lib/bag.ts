// Shopping bag: types, limits and pure rules. DB-free and cookie-free so it can
// be unit-tested and imported by client components. Server I/O lives in
// `./bag-store` (cookies) and `./products` (catalog reads).
//
// The bag cookie stores only references and quantities — never prices, names
// or stock. Everything else is resolved from the database on every read, so a
// tampered cookie can at most ask for things the server then refuses.

import type { Img } from "./catalog";

export const BAG_COOKIE = "atelier_bag";
/** Non-httpOnly hint for the header badge; never trusted by the server. */
export const BAG_COUNT_COOKIE = "atelier_bag_count";
/** Fired on `window` after a client-side bag change, so the header can re-read the count. */
export const BAG_CHANGE_EVENT = "bag:change";

export const MAX_BAG_LINES = 20;
export const MAX_LINE_QUANTITY = 10;
export const MAX_SIZE_LENGTH = 20;

/** One line in the bag cookie. `size` is null for one-size products. */
export type BagLine = {
  productId: number;
  size: string | null;
  quantity: number;
};

/** Current catalog data for a product in the bag (from `getBagProducts`). */
export type BagProduct = {
  id: number;
  slug: string;
  name: string;
  image: Img;
  priceCents: number;
  stock: { size: string | null; quantity: number }[];
};

export type BagItemStatus =
  /** Requested quantity is available. */
  | "ok"
  /** Stock dropped below the requested quantity; priced at what's left. */
  | "reduced"
  /** Size exists but has no stock; excluded from the subtotal. */
  | "sold_out"
  /** The size no longer exists for this product; excluded from the subtotal. */
  | "unavailable";

export type BagItem = {
  productId: number;
  slug: string;
  name: string;
  image: Img;
  size: string | null;
  unitPriceCents: number;
  /** Units in stock for this size right now. */
  stock: number;
  /** Highest quantity the customer may choose: min(stock, MAX_LINE_QUANTITY). */
  maxQuantity: number;
  /** Quantity stored in the bag. */
  quantity: number;
  /** Quantity that counts toward the subtotal. */
  purchasableQuantity: number;
  lineTotalCents: number;
  status: BagItemStatus;
};

export type PricedBag = {
  items: BagItem[];
  /** Sum of purchasable line totals, in cents. */
  subtotalCents: number;
  /** Purchasable units. */
  count: number;
};

export type BagError = "invalid" | "unavailable" | "sold_out" | "stock" | "bag_full";

export type BagResult =
  | { ok: true; count: number }
  | { ok: false; error: BagError; limit?: number; inBag?: number };

/* -----------------------------------------------------------------------------
   Input validation (cookie and server action inputs are untrusted)
   -------------------------------------------------------------------------- */

export function parseProductId(value: unknown): number | undefined {
  const n = typeof value === "string" && /^\d{1,9}$/.test(value) ? Number(value) : value;
  return typeof n === "number" && Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

/** A size label, or null for one-size. Empty string (from forms) means null. */
export function parseSize(value: unknown): string | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value === "string" && value.length <= MAX_SIZE_LENGTH) return value;
  return undefined;
}

export function parseQuantity(value: unknown): number | undefined {
  const n = typeof value === "string" && /^\d{1,3}$/.test(value) ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= MAX_LINE_QUANTITY
    ? n
    : undefined;
}

/* -----------------------------------------------------------------------------
   Cookie codec
   -------------------------------------------------------------------------- */

/** Parses the cookie's JSON. Never throws; malformed or duplicate lines are dropped. */
export function parseBag(json: string | undefined): BagLine[] {
  if (!json) return [];
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const lines: BagLine[] = [];
  for (const entry of data) {
    if (lines.length >= MAX_BAG_LINES) break;
    if (!Array.isArray(entry) || entry.length !== 3) continue;
    const productId = typeof entry[0] === "number" ? parseProductId(entry[0]) : undefined;
    const size = entry[1] === "" ? undefined : parseSize(entry[1]);
    const quantity =
      typeof entry[2] === "number" && Number.isInteger(entry[2]) && entry[2] >= 1
        ? Math.min(entry[2], MAX_LINE_QUANTITY)
        : undefined;
    if (productId === undefined || size === undefined || quantity === undefined) continue;
    if (findLine(lines, productId, size)) continue;
    lines.push({ productId, size, quantity });
  }
  return lines;
}

export function serializeBag(lines: BagLine[]): string {
  return JSON.stringify(lines.map((l) => [l.productId, l.size, l.quantity]));
}

/** Units stored in the bag (header badge). */
export function bagCount(lines: BagLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

/* -----------------------------------------------------------------------------
   Line operations (return new arrays)
   -------------------------------------------------------------------------- */

export function findLine(lines: BagLine[], productId: number, size: string | null) {
  return lines.find((l) => l.productId === productId && l.size === size);
}

/** Adds `quantity` to the matching line, or appends a new one. */
export function addLine(lines: BagLine[], line: BagLine): BagLine[] {
  return findLine(lines, line.productId, line.size)
    ? lines.map((l) =>
        l.productId === line.productId && l.size === line.size
          ? { ...l, quantity: l.quantity + line.quantity }
          : l,
      )
    : [...lines, line];
}

export function setLineQuantity(
  lines: BagLine[],
  productId: number,
  size: string | null,
  quantity: number,
): BagLine[] {
  return lines.map((l) =>
    l.productId === productId && l.size === size ? { ...l, quantity } : l,
  );
}

export function removeLine(lines: BagLine[], productId: number, size: string | null) {
  return lines.filter((l) => !(l.productId === productId && l.size === size));
}

/* -----------------------------------------------------------------------------
   Stock and pricing
   -------------------------------------------------------------------------- */

function stockFor(product: BagProduct | undefined, size: string | null) {
  return product?.stock.find((s) => s.size === size);
}

/**
 * The most of (product, size) one bag may hold, or undefined if that
 * product/size doesn't exist. 0 means sold out.
 */
export function lineLimit(product: BagProduct | undefined, size: string | null) {
  const row = stockFor(product, size);
  return row ? Math.min(row.quantity, MAX_LINE_QUANTITY) : undefined;
}

/**
 * Brings stored lines in line with the catalog before writing the cookie:
 * drops lines whose product or size is gone and lowers quantities to what's in
 * stock. Sold-out lines are kept so the customer sees why they can't buy them.
 */
export function normalizeBag(lines: BagLine[], products: BagProduct[]): BagLine[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return lines.flatMap((line) => {
    const limit = lineLimit(byId.get(line.productId), line.size);
    if (limit === undefined) return [];
    if (limit === 0) return [line];
    return [{ ...line, quantity: Math.min(line.quantity, limit) }];
  });
}

/** Resolves lines against current catalog data. Lines whose product is gone are omitted. */
export function priceBag(lines: BagLine[], products: BagProduct[]): PricedBag {
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: BagItem[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) continue;

    const row = stockFor(product, line.size);
    const stock = row?.quantity ?? 0;
    const maxQuantity = Math.min(stock, MAX_LINE_QUANTITY);
    const status: BagItemStatus = !row
      ? "unavailable"
      : stock === 0
        ? "sold_out"
        : line.quantity > maxQuantity
          ? "reduced"
          : "ok";
    const purchasableQuantity =
      status === "ok" ? line.quantity : status === "reduced" ? maxQuantity : 0;

    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: line.size,
      unitPriceCents: product.priceCents,
      stock,
      maxQuantity,
      quantity: line.quantity,
      purchasableQuantity,
      lineTotalCents: product.priceCents * purchasableQuantity,
      status,
    });
  }

  return {
    items,
    subtotalCents: items.reduce((sum, i) => sum + i.lineTotalCents, 0),
    count: items.reduce((sum, i) => sum + i.purchasableQuantity, 0),
  };
}

/* -----------------------------------------------------------------------------
   Messages
   -------------------------------------------------------------------------- */

export function bagErrorMessage(result: Extract<BagResult, { ok: false }>) {
  switch (result.error) {
    case "stock": {
      const { limit = 0, inBag = 0 } = result;
      if (inBag > 0 && inBag >= limit) {
        return `You already have ${inBag} in your bag, the most available.`;
      }
      return limit === 1 ? "Only 1 available." : `Only ${limit} available.`;
    }
    case "sold_out":
      return "This item has just sold out.";
    case "unavailable":
      return "This item is no longer available.";
    case "bag_full":
      return "Your bag is full. Remove an item to add another.";
    default:
      return "Something went wrong. Please try again.";
  }
}
