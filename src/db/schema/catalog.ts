import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { Img } from "../../lib/catalog";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  image: jsonb("image").$type<Img>().notNull(),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    /** Style number; also the JSON-LD `sku`. */
    reference: text("reference").notNull().unique(),
    /** Minor units (cents). */
    priceCents: integer("price_cents").notNull(),
    badge: text("badge"),
    color: text("color").notNull(),
    description: text("description").notNull(),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    /** Listing / card image */
    image: jsonb("image").$type<Img>().notNull(),
    /** Detail page images, 4:5 */
    gallery: jsonb("gallery").$type<Img[]>().notNull().default([]),
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    isMostWanted: boolean("is_most_wanted").notNull().default(false),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    check("products_price_cents_check", sql`${t.priceCents} >= 0`),
  ],
);

/**
 * Stock per product and size. One-size products have a single row with a
 * null `size`; sized products have one row per size, ordered by `position`.
 */
export const productStock = pgTable(
  "product_stock",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size"),
    quantity: integer("quantity").notNull().default(0),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    unique("product_stock_product_id_size_key")
      .on(t.productId, t.size)
      .nullsNotDistinct(),
    check("product_stock_quantity_check", sql`${t.quantity} >= 0`),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stock: many(productStock),
}));

export const productStockRelations = relations(productStock, ({ one }) => ({
  product: one(products, {
    fields: [productStock.productId],
    references: [products.id],
  }),
}));
