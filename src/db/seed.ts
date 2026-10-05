// Seeds the catalog tables with the sample catalog. Idempotent: categories and
// products are upserted by slug, and each seeded product's stock is replaced.
// Usage: npm run db:seed
import "dotenv/config";
import { inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { categories, products, productStock } from "./schema";
import * as data from "./seed-data";

const excluded = (column: string) => sql.raw(`excluded.${column}`);

async function main() {
  const categoryRows = await db
    .insert(categories)
    .values(data.categories.map((c, position) => ({ ...c, position })))
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: excluded("name"),
        image: excluded("image"),
        position: excluded("position"),
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: categories.id, name: categories.name });

  const categoryId = new Map(categoryRows.map((c) => [c.name, c.id]));
  const newArrivals = new Set(data.newArrivalSlugs);
  const mostWanted = new Set(data.mostWantedSlugs);

  const productRows = await db
    .insert(products)
    .values(
      data.products.map((p, position) => {
        const id = categoryId.get(p.category);
        if (id === undefined) throw new Error(`Unknown category "${p.category}" for ${p.slug}`);
        return {
          slug: p.slug,
          categoryId: id,
          name: p.name,
          reference: p.reference,
          priceCents: p.price * 100,
          badge: p.badge ?? null,
          color: p.color,
          description: p.description,
          details: p.details,
          image: p.image,
          gallery: p.gallery,
          isNewArrival: newArrivals.has(p.slug),
          isMostWanted: mostWanted.has(p.slug),
          position,
        };
      }),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        categoryId: excluded("category_id"),
        name: excluded("name"),
        reference: excluded("reference"),
        priceCents: excluded("price_cents"),
        badge: excluded("badge"),
        color: excluded("color"),
        description: excluded("description"),
        details: excluded("details"),
        image: excluded("image"),
        gallery: excluded("gallery"),
        isNewArrival: excluded("is_new_arrival"),
        isMostWanted: excluded("is_most_wanted"),
        position: excluded("position"),
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, slug: products.slug });

  const productId = new Map(productRows.map((p) => [p.slug, p.id]));

  const stockRows = data.products.flatMap((p): (typeof productStock.$inferInsert)[] => {
    const id = productId.get(p.slug)!;
    return p.sizes
      ? p.sizes.map((s, position) => ({
          productId: id,
          size: s.label,
          quantity: s.stock,
          position,
        }))
      : [{ productId: id, size: null, quantity: p.stock ?? 0, position: 0 }];
  });

  // Replace stock atomically (neon-http batches run in one transaction).
  await db.batch([
    db.delete(productStock).where(inArray(productStock.productId, [...productId.values()])),
    db.insert(productStock).values(stockRows),
  ]);

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${stockRows.length} stock rows.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
