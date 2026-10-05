// Seed data for the catalog tables: the sample catalog the storefront shipped
// with before products moved to the database. Run with `npm run db:seed`.
// Photography: Unsplash (https://unsplash.com/license).

import type { Img, Product, Size } from "../lib/catalog";
import { UNSPLASH_PHOTO, unsplash } from "../lib/catalog";

/**
 * A 4:5 detail gallery from one photo: the full frame, then close-up crops
 * at the given focal points ([x, y, zoom], 0–1 coordinates).
 */
function gallery(
  id: string,
  name: string,
  crops: [x: number, y: number, zoom: number][],
): Img[] {
  const base = `${UNSPLASH_PHOTO}${id}?auto=format&fit=crop&w=1600&h=2000&q=80`;
  return [
    { src: base, alt: name },
    ...crops.map(([x, y, z], i) => ({
      src: `${base}&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${z}`,
      alt: `${name}, detail ${i + 1}`,
    })),
  ];
}

export type SeedProduct = Omit<Product, "category" | "price"> & {
  /** Category name, matched against `categories[].name`. */
  category: string;
  /** Whole US dollars; stored as cents. */
  price: number;
};

export type SeedCategory = {
  slug: string;
  name: string;
  image: Img;
};

const shoeSizes = (stock: number[]): Size[] =>
  ["36", "37", "38", "39", "40", "41"].map((label, i) => ({
    label,
    stock: stock[i] ?? 0,
  }));

const mensShoeSizes = (stock: number[]): Size[] =>
  ["40", "41", "42", "43", "44", "45"].map((label, i) => ({
    label,
    stock: stock[i] ?? 0,
  }));

export const products: SeedProduct[] = [
  {
    slug: "siena-top-handle-bag",
    name: "Siena top handle bag",
    category: "Bags",
    price: 3450,
    badge: "New",
    image: unsplash(
      "1691480150204-66dd1eb77391",
      "Cognac leather top handle bag on a white background",
    ),
    gallery: gallery("1691480150204-66dd1eb77391", "Siena top handle bag", [
      [0.35, 0.3, 2.4],
      [0.55, 0.65, 2.2],
    ]),
    color: "Cognac",
    reference: "AT-1042 CG",
    description:
      "A structured top handle bag in polished calf leather, built around a single rolled handle and a flap that closes on two buckled straps. Sized to carry the day without losing its line.",
    details: [
      "Polished calf leather",
      "Gold-toned hardware",
      "Detachable, adjustable shoulder strap",
      "Microsuede lining with one interior zip pocket",
      "W 32cm × H 22cm × D 14cm",
      "Made in Italy",
    ],
    stock: 2,
  },
  {
    slug: "archivio-satchel",
    name: "Archivio leather satchel",
    category: "Bags",
    price: 2900,
    image: unsplash(
      "1605733513597-a8f8341084e6",
      "Grey leather satchel with gold buckles",
    ),
    gallery: gallery("1605733513597-a8f8341084e6", "Archivio leather satchel", [
      [0.5, 0.35, 2.4],
      [0.35, 0.6, 2.6],
    ]),
    color: "Dove grey",
    reference: "AT-1107 DG",
    description:
      "Drawn from the workshop's archive of document cases, the Archivio satchel pairs a pebbled grain with twin buckled straps and a flat top handle.",
    details: [
      "Pebbled calf leather",
      "Gold-toned buckles",
      "Two interior compartments",
      "W 28cm × H 21cm × D 9cm",
      "Made in Italy",
    ],
    stock: 9,
  },
  {
    slug: "marcello-suede-loafer",
    name: "Marcello suede loafer",
    category: "Shoes",
    price: 1150,
    badge: "New",
    image: unsplash(
      "1676121270762-47c8d3a7b9d5",
      "Pair of brown suede loafers with gold hardware",
    ),
    gallery: gallery("1676121270762-47c8d3a7b9d5", "Marcello suede loafer", [
      [0.3, 0.4, 2.6],
      [0.7, 0.55, 2.4],
    ]),
    color: "Tobacco suede",
    reference: "AT-2210 TS",
    description:
      "An unlined loafer in soft suede that shapes to the foot from the first wear, finished with a slim metal bar across the vamp.",
    details: [
      "Suede upper, unlined",
      "Leather sole with rubber insert",
      "Gold-toned metal bar",
      "Blake-stitched construction",
      "Made in Italy",
    ],
    sizes: mensShoeSizes([0, 2, 5, 4, 1, 0]),
  },
  {
    slug: "lido-sunglasses",
    name: "Lido round sunglasses",
    category: "Eyewear",
    price: 520,
    image: unsplash(
      "1584036553516-bf83210aa16c",
      "Black framed sunglasses on a white surface",
    ),
    gallery: gallery("1584036553516-bf83210aa16c", "Lido round sunglasses", [
      [0.5, 0.45, 2.2],
      [0.3, 0.5, 2.8],
    ]),
    color: "Black / grey gradient",
    reference: "AT-5031 BK",
    description:
      "A softened round frame in hand-polished acetate with gradient lenses and slim metal temples.",
    details: [
      "Acetate front, metal temples",
      "Gradient lenses, 100% UV protection",
      "Lens width 52mm",
      "Supplied with a leather case",
      "Made in Italy",
    ],
    stock: 14,
  },
  {
    slug: "giallo-mini-bag",
    name: "Giallo mini bag",
    category: "Bags",
    price: 2650,
    badge: "New",
    image: unsplash(
      "1640901555383-7335ec5a6476",
      "Yellow structured handbag with a top handle",
    ),
    gallery: gallery("1640901555383-7335ec5a6476", "Giallo mini bag", [
      [0.5, 0.3, 2.4],
      [0.5, 0.65, 2.4],
    ]),
    color: "Saffron",
    reference: "AT-1188 SF",
    description:
      "A compact, architectural bag in saffron box calf with a turn-lock closure. Carried by hand or worn on the shoulder.",
    details: [
      "Box calf leather",
      "Turn-lock closure",
      "Detachable shoulder strap",
      "W 20cm × H 15cm × D 8cm",
      "Made in Italy",
    ],
    stock: 0,
  },
  {
    slug: "brera-penny-loafer",
    name: "Brera penny loafer",
    category: "Shoes",
    price: 980,
    image: unsplash(
      "1675947258177-aa8120ddefa3",
      "Brown leather penny loafer on a white surface",
    ),
    gallery: gallery("1675947258177-aa8120ddefa3", "Brera penny loafer", [
      [0.45, 0.45, 2.4],
      [0.6, 0.6, 2.8],
    ]),
    color: "Chestnut",
    reference: "AT-2244 CH",
    description:
      "The classic penny loafer, hand-burnished to deepen the chestnut leather and set on a stacked leather heel.",
    details: [
      "Burnished calf leather",
      "Leather lining and sole",
      "Goodyear-welted",
      "Made in Italy",
    ],
    sizes: mensShoeSizes([3, 6, 6, 4, 2, 1]),
  },
  {
    slug: "stella-crystal-pump",
    name: "Stella crystal pump",
    category: "Shoes",
    price: 1390,
    image: unsplash(
      "1581101767113-1677fc2beaa8",
      "Pair of crystal-embellished peep toe pumps",
    ),
    gallery: gallery("1581101767113-1677fc2beaa8", "Stella crystal pump", [
      [0.4, 0.5, 2.4],
      [0.65, 0.35, 2.6],
    ]),
    color: "Crystal",
    reference: "AT-2301 CR",
    description:
      "A peep toe pump covered entirely in hand-set crystals, balanced on a 100mm heel for evening.",
    details: [
      "Hand-applied crystal embellishment",
      "Leather lining and sole",
      "Heel height 100mm",
      "Made in Italy",
    ],
    sizes: shoeSizes([0, 1, 0, 2, 0, 0]),
  },
  {
    slug: "viaggio-doctor-bag",
    name: "Viaggio doctor bag",
    category: "Bags",
    price: 3800,
    image: unsplash(
      "1691480250099-a63081ecfcb8",
      "Brown leather doctor bag with buckled straps",
    ),
    gallery: gallery("1691480250099-a63081ecfcb8", "Viaggio doctor bag", [
      [0.5, 0.3, 2.4],
      [0.4, 0.6, 2.4],
    ]),
    color: "Tan",
    reference: "AT-1230 TN",
    description:
      "A frame doctor bag that opens wide, in vegetable-tanned leather that darkens and softens with use.",
    details: [
      "Vegetable-tanned leather",
      "Hinged metal frame",
      "Buckled side straps",
      "W 36cm × H 26cm × D 18cm",
      "Made in Italy",
    ],
    stock: 5,
  },
  {
    slug: "rosa-mini-bag",
    name: "Rosa mini shoulder bag",
    category: "Bags",
    price: 2200,
    image: unsplash(
      "1681747685985-a401c271156c",
      "Pink leather mini bag on a marble counter",
    ),
    gallery: gallery("1681747685985-a401c271156c", "Rosa mini shoulder bag", [
      [0.5, 0.45, 2.4],
      [0.4, 0.3, 2.6],
    ]),
    color: "Blush",
    reference: "AT-1195 BL",
    description:
      "A rounded mini bag in quilted blush leather with a teardrop clasp and a fine chain strap.",
    details: [
      "Quilted lambskin",
      "Gold-toned chain strap",
      "Magnetic clasp",
      "W 19cm × H 14cm × D 7cm",
      "Made in Italy",
    ],
    stock: 3,
  },
  {
    slug: "catena-necklace",
    name: "Catena chain necklace",
    category: "Jewelry",
    price: 1750,
    image: unsplash(
      "1611107683227-e9060eccd846",
      "Gold chain necklace on a white surface",
    ),
    gallery: gallery("1611107683227-e9060eccd846", "Catena chain necklace", [
      [0.5, 0.5, 2.4],
      [0.3, 0.4, 3],
    ]),
    color: "Yellow gold",
    reference: "AT-4012 YG",
    description:
      "Interlocking oval links in 18k gold vermeil, finished with a lobster clasp stamped with the house mark.",
    details: [
      "18k gold vermeil on sterling silver",
      "Length 45cm",
      "Lobster clasp",
      "Made in Italy",
    ],
    stock: 11,
  },
  {
    slug: "riva-loafer",
    name: "Riva leather loafer",
    category: "Shoes",
    price: 1050,
    image: unsplash(
      "1616406432452-07bc5938759d",
      "Brown leather loafers on blue fabric",
    ),
    gallery: gallery("1616406432452-07bc5938759d", "Riva leather loafer", [
      [0.4, 0.45, 2.4],
      [0.65, 0.55, 2.6],
    ]),
    color: "Cognac",
    reference: "AT-2260 CG",
    description:
      "A softly structured loafer in polished leather with a metal bar and a hand-stitched apron toe.",
    details: [
      "Polished calf leather",
      "Leather lining and sole",
      "Hand-stitched apron",
      "Made in Italy",
    ],
    sizes: mensShoeSizes([1, 3, 4, 4, 2, 0]),
  },
  {
    slug: "mercato-tote",
    name: "Mercato leather tote",
    category: "Bags",
    price: 2450,
    image: unsplash(
      "1624687943971-e86af76d57de",
      "Tan leather tote bag hanging on a white wall",
    ),
    gallery: gallery("1624687943971-e86af76d57de", "Mercato leather tote", [
      [0.5, 0.35, 2.2],
      [0.5, 0.65, 2.6],
    ]),
    color: "Tan",
    reference: "AT-1150 TN",
    description:
      "An unstructured tote in waxed leather, cut from a single hide and roomy enough for a laptop.",
    details: [
      "Waxed full-grain leather",
      "Unlined, with removable pouch",
      "W 40cm × H 34cm × D 14cm",
      "Made in Italy",
    ],
    stock: 7,
  },
  {
    slug: "giardino-cocktail-ring",
    name: "Giardino cocktail rings",
    category: "Jewelry",
    price: 4300,
    image: unsplash(
      "1592317295760-5c1f677dfc78",
      "Gold rings set with coloured gemstones",
    ),
    gallery: gallery("1592317295760-5c1f677dfc78", "Giardino cocktail rings", [
      [0.35, 0.5, 2.4],
      [0.7, 0.5, 2.4],
    ]),
    color: "Yellow gold / mixed stones",
    reference: "AT-4105 MX",
    description:
      "Cocktail rings set with tourmaline, topaz and peridot in hand-engraved gold settings. Each stone is unique.",
    details: [
      "18k yellow gold",
      "Natural tourmaline, topaz and peridot",
      "Hand-engraved setting",
      "Made in Italy",
    ],
    sizes: ["50", "52", "54", "56"].map((label, i) => ({
      label,
      stock: [1, 0, 2, 0][i],
    })),
  },
  {
    slug: "notte-weekender",
    name: "Notte bowling bag",
    category: "Bags",
    price: 3100,
    image: unsplash(
      "1705909237050-7a7625b47fac",
      "Black leather bowling bag on a yellow background",
    ),
    gallery: gallery("1705909237050-7a7625b47fac", "Notte bowling bag", [
      [0.5, 0.35, 2.4],
      [0.6, 0.6, 2.6],
    ]),
    color: "Black",
    reference: "AT-1212 BK",
    description:
      "A rounded bowling bag in grained black leather with contrast trim, rolled handles and a two-way zip.",
    details: [
      "Grained calf leather",
      "Two-way zip closure",
      "Detachable shoulder strap",
      "W 34cm × H 24cm × D 16cm",
      "Made in Italy",
    ],
    stock: 4,
  },
];

export const newArrivalSlugs = [
  "siena-top-handle-bag",
  "archivio-satchel",
  "marcello-suede-loafer",
  "lido-sunglasses",
  "giallo-mini-bag",
  "brera-penny-loafer",
  "stella-crystal-pump",
  "viaggio-doctor-bag",
];

export const mostWantedSlugs = [
  "rosa-mini-bag",
  "catena-necklace",
  "riva-loafer",
  "mercato-tote",
  "giardino-cocktail-ring",
  "notte-weekender",
];

export const categories: SeedCategory[] = [
  {
    slug: "bags",
    name: "Bags",
    image: unsplash(
      "1605733513597-a8f8341084e6",
      "Grey leather satchel with gold buckles",
    ),
  },
  {
    slug: "shoes",
    name: "Shoes",
    image: unsplash(
      "1519226719127-9e805abb99b1",
      "Pair of pointed-toe platform stilettos",
    ),
  },
  {
    slug: "jewelry",
    name: "Jewelry",
    image: unsplash(
      "1585960622850-ed33c41d6418",
      "Woman wearing layered gold necklaces",
    ),
  },
  {
    slug: "eyewear",
    name: "Eyewear",
    image: unsplash(
      "1577803645773-f96470509666",
      "White framed sunglasses with brown lenses by the sea",
    ),
  },
  {
    slug: "fragrance",
    name: "Fragrance",
    image: unsplash(
      "1594125311687-3b1b3eafa9f4",
      "Clear glass perfume bottle on a white table",
    ),
  },
];
