// Catalog types, pure helpers (price, stock) and editorial content.
// Products and categories live in the database: query them via `@/lib/products`.
// This module must stay free of DB imports — client components use it.
// Photography: Unsplash (https://unsplash.com/license).

export type Img = {
  src: string;
  alt: string;
};

export type Size = {
  label: string;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  category: { slug: string; name: string };
  /** Cents */
  price: number;
  /** Listing / card image */
  image: Img;
  /** Detail page images, 4:5 */
  gallery: Img[];
  badge?: string;
  color: string;
  reference: string;
  description: string;
  details: string[];
  /** Stock for one-size products; sized products use `sizes[].stock`. */
  stock?: number;
  sizes?: Size[];
};

export type Collection = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: Img;
};

export type Category = {
  slug: string;
  name: string;
  image: Img;
};

export const UNSPLASH_PHOTO = "https://images.unsplash.com/photo-";

export function unsplash(id: string, alt: string): Img {
  // Cap the source size; next/image resizes from here.
  return {
    src: `${UNSPLASH_PHOTO}${id}?auto=format&fit=crop&w=2000&q=80`,
    alt,
  };
}

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Formats a price given in cents. */
export function formatPrice(cents: number) {
  return priceFormat.format(cents / 100);
}

export function categoryHref(slug: string) {
  return `/categories/${slug}`;
}

export const hero = {
  eyebrow: "Autumn – Winter 2026",
  title: "The Colour of Quiet",
  description:
    "Saturated tailoring, softened silhouettes and leather shaped by hand.",
  cta: { label: "Discover the collection", href: "/collections/autumn-winter" },
  image: unsplash(
    "1662532577856-e8ee8b138a8b",
    "Model in a red tailored outfit seated against a clear blue sky",
  ),
};

export const featuredCollections: Collection[] = [
  {
    slug: "women",
    eyebrow: "Women",
    title: "Tailoring in Bloom",
    description: "Sharp shoulders, fluid trousers and deep seasonal reds.",
    image: unsplash(
      "1580478491436-fd6a937acc9e",
      "Woman in a red blazer seated on a stone staircase",
    ),
  },
  {
    slug: "men",
    eyebrow: "Men",
    title: "The Camel Edit",
    description: "Double-faced wool coats and knits in warm neutrals.",
    image: unsplash(
      "1619603364904-c0498317e145",
      "Man in a camel overcoat and black trousers",
    ),
  },
];

/* -----------------------------------------------------------------------------
   Stock
   -------------------------------------------------------------------------- */

export type StockState = "in_stock" | "low_stock" | "sold_out";

export const LOW_STOCK_THRESHOLD = 3;

export function totalStock(product: Product) {
  return product.sizes
    ? product.sizes.reduce((sum, size) => sum + size.stock, 0)
    : (product.stock ?? 0);
}

export function stockState(quantity: number): StockState {
  if (quantity <= 0) return "sold_out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export function stockLabel(quantity: number) {
  switch (stockState(quantity)) {
    case "sold_out":
      return "Sold out";
    case "low_stock":
      return quantity === 1 ? "Only 1 left" : `Only ${quantity} left`;
    default:
      return "In stock";
  }
}

export const campaign = {
  eyebrow: "Eyewear",
  title: "Seen in the City",
  description: "Oversized frames for the shortest days of the year.",
  cta: { label: "Shop eyewear", href: "/categories/eyewear" },
  image: unsplash(
    "1645561305502-63a9ba09ab09",
    "Woman in a grey coat and dark sunglasses",
  ),
};

export const editorial = {
  eyebrow: "The Atelier",
  title: "Made Slowly, Worn Always",
  body: [
    "Every coat begins as a paper pattern drafted by hand. It is cut, basted and fitted three times before a single seam is closed.",
    "This season the workshop returns to the trench: water-repellent cotton gabardine, horn buttons and a storm flap lined in silk.",
  ],
  cta: { label: "Read the story", href: "/stories/the-trench" },
  image: unsplash(
    "1676716105765-e19fe6a01851",
    "Woman walking down a city street in a trench coat",
  ),
};

export const services = [
  {
    title: "Complimentary Shipping",
    body: "Free express delivery and returns on every order.",
  },
  {
    title: "Personalisation",
    body: "Hot-stamped initials on selected leather goods.",
  },
  {
    title: "Book an Appointment",
    body: "Shop in store or by video with a client advisor.",
  },
  {
    title: "Gift Wrapping",
    body: "Every order arrives in our signature box.",
  },
];

export const navigation = [
  { label: "New In", href: "/new-in" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Bags", href: "/categories/bags" },
  { label: "Shoes", href: "/categories/shoes" },
  { label: "Jewelry", href: "/categories/jewelry" },
  { label: "Eyewear", href: "/categories/eyewear" },
  { label: "Fragrance", href: "/categories/fragrance" },
];
