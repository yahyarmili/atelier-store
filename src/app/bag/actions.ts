"use server";

import {
  MAX_BAG_LINES,
  addLine,
  findLine,
  lineLimit,
  normalizeBag,
  parseProductId,
  parseQuantity,
  parseSize,
  priceBag,
  removeLine,
  setLineQuantity,
  type BagError,
  type BagLine,
  type BagProduct,
  type BagResult,
} from "@/lib/bag";
import { readBag, writeBag } from "@/lib/bag-store";
import { getBagProducts } from "@/lib/products";

// Bag mutations. Server Actions are public endpoints: every input is
// re-validated and every quantity checked against live stock here, whatever
// the UI allowed. No sign-in required — the bag is a per-browser cookie.

function fail(error: BagError, extra?: { limit: number; inBag: number }): BagResult {
  return { ok: false, error, ...extra };
}

/** The stored bag, normalized against live stock, plus the catalog rows used. */
async function loadBag(slug?: string) {
  const stored = await readBag();
  const products = await getBagProducts(
    stored.map((l) => l.productId),
    slug,
  );
  return { lines: normalizeBag(stored, products), products };
}

async function save(lines: BagLine[], products: BagProduct[]): Promise<BagResult> {
  const normalized = normalizeBag(lines, products);
  const { count } = priceBag(normalized, products);
  await writeBag(normalized, count);
  return { ok: true, count };
}

/** Called from the product page. Adds `quantity` (default 1) of (slug, size). */
export async function addToBag(input: {
  slug: string;
  size: string | null;
  quantity?: number;
}): Promise<BagResult> {
  const slug =
    typeof input?.slug === "string" && /^[a-z0-9-]{1,200}$/.test(input.slug)
      ? input.slug
      : undefined;
  const size = parseSize(input?.size);
  const quantity = parseQuantity(input?.quantity ?? 1);
  if (!slug || size === undefined || quantity === undefined) return fail("invalid");

  const { lines, products } = await loadBag(slug);
  const product = products.find((p) => p.slug === slug);
  const limit = lineLimit(product, size);
  if (!product || limit === undefined) return fail("unavailable");
  if (limit === 0) return fail("sold_out");

  const inBag = findLine(lines, product.id, size)?.quantity ?? 0;
  if (inBag + quantity > limit) return fail("stock", { limit, inBag });
  if (inBag === 0 && lines.length >= MAX_BAG_LINES) return fail("bag_full");

  return save(addLine(lines, { productId: product.id, size, quantity }), products);
}

/** Bag page quantity form (`useActionState`). Sets a line to an exact quantity. */
export async function setBagQuantity(
  _prev: BagResult | null,
  formData: FormData,
): Promise<BagResult> {
  const productId = parseProductId(formData.get("productId"));
  const size = parseSize(formData.get("size"));
  const quantity = parseQuantity(formData.get("quantity"));
  if (productId === undefined || size === undefined || quantity === undefined) {
    return fail("invalid");
  }

  const { lines, products } = await loadBag();
  if (!findLine(lines, productId, size)) return fail("unavailable");
  const limit = lineLimit(
    products.find((p) => p.id === productId),
    size,
  );
  if (limit === undefined) return fail("unavailable");
  if (limit === 0) return fail("sold_out");
  if (quantity > limit) return fail("stock", { limit, inBag: 0 });

  return save(setLineQuantity(lines, productId, size, quantity), products);
}

/** Bag page remove form (`useActionState`). */
export async function removeFromBag(_prev: null, formData: FormData): Promise<null> {
  const productId = parseProductId(formData.get("productId"));
  const size = parseSize(formData.get("size"));
  if (productId === undefined || size === undefined) return null;

  const { lines, products } = await loadBag();
  await save(removeLine(lines, productId, size), products);
  return null;
}
