import "server-only";
import { asc, eq, type SQL } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, products, productStock } from "@/db/schema";
import type { Category, Product } from "./catalog";

// Catalog reads for Server Components. Rows are mapped to the `Product` /
// `Category` shapes from `./catalog`, so UI components stay DB-agnostic.

function findRows(where?: SQL, limit?: number) {
  return db.query.products.findMany({
    where,
    limit,
    with: {
      category: { columns: { slug: true, name: true } },
      stock: {
        columns: { size: true, quantity: true },
        orderBy: [asc(productStock.position)],
      },
    },
    orderBy: [asc(products.position), asc(products.id)],
  });
}

type ProductRow = Awaited<ReturnType<typeof findRows>>[number];

function toProduct(row: ProductRow): Product {
  const oneSize = row.stock.length === 1 && row.stock[0].size === null;

  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.priceCents,
    image: row.image,
    gallery: row.gallery,
    badge: row.badge ?? undefined,
    color: row.color,
    reference: row.reference,
    description: row.description,
    details: row.details,
    ...(oneSize
      ? { stock: row.stock[0].quantity }
      : row.stock.length > 0
        ? {
            sizes: row.stock.map((s) => ({ label: s.size ?? "", stock: s.quantity })),
          }
        : { stock: 0 }),
  };
}

async function findProducts(where?: SQL) {
  return (await findRows(where)).map(toProduct);
}

export function getProducts() {
  return findProducts();
}

export function getNewArrivals() {
  return findProducts(eq(products.isNewArrival, true));
}

export function getMostWanted() {
  return findProducts(eq(products.isMostWanted, true));
}

/** Deduplicated per request (metadata + page both call it). */
export const getProduct = cache(async (slug: string) => {
  const [row] = await findRows(eq(products.slug, slug), 1);
  return row ? toProduct(row) : undefined;
});

export async function getProductSlugs() {
  return db.select({ slug: products.slug }).from(products);
}

/** Same category first, then the rest of the catalog. */
export async function getRelatedProducts(product: Product, limit = 8) {
  const others = (await getProducts()).filter((p) => p.slug !== product.slug);
  const sameCategory = (p: Product) => p.category.slug === product.category.slug;
  return [
    ...others.filter(sameCategory),
    ...others.filter((p) => !sameCategory(p)),
  ].slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  return db
    .select({ slug: categories.slug, name: categories.name, image: categories.image })
    .from(categories)
    .orderBy(asc(categories.position), asc(categories.id));
}
