import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  MAX_BAG_LINES,
  MAX_LINE_QUANTITY,
  addLine,
  bagCount,
  bagErrorMessage,
  lineLimit,
  normalizeBag,
  parseBag,
  parseProductId,
  parseQuantity,
  parseSize,
  priceBag,
  removeLine,
  serializeBag,
  setLineQuantity,
  type BagLine,
  type BagProduct,
} from "./bag";

const img = { src: "https://example.com/a.jpg", alt: "" };

const bag: BagProduct = {
  id: 1,
  slug: "bag",
  name: "Bag",
  image: img,
  priceCents: 125_000,
  stock: [{ size: null, quantity: 3 }],
};
const shoe: BagProduct = {
  id: 2,
  slug: "shoe",
  name: "Shoe",
  image: img,
  priceCents: 79_500,
  stock: [
    { size: "38", quantity: 0 },
    { size: "39", quantity: 2 },
    { size: "40", quantity: 25 },
  ],
};

describe("parseBag", () => {
  test("round-trips serializeBag", () => {
    const lines: BagLine[] = [
      { productId: 1, size: null, quantity: 2 },
      { productId: 2, size: "39", quantity: 1 },
    ];
    assert.deepEqual(parseBag(serializeBag(lines)), lines);
  });

  test("returns [] for missing, malformed or non-array input", () => {
    for (const raw of [undefined, "", "{", "null", "{}", '"x"', "42"]) {
      assert.deepEqual(parseBag(raw), [], String(raw));
    }
  });

  test("drops invalid lines and keeps valid ones", () => {
    const raw = JSON.stringify([
      [1, null, 1],
      [0, null, 1], // id must be positive
      [-3, null, 1],
      [1.5, null, 1],
      ["2", null, 1], // id must be a number
      [2, "", 1], // empty size
      [2, 39, 1], // size must be a string
      [2, "x".repeat(21), 1], // size too long
      [2, "39", 0], // quantity must be >= 1
      [2, "39", 1.5],
      [2, "39"], // wrong arity
      "junk",
      [2, "40", 3],
    ]);
    assert.deepEqual(parseBag(raw), [
      { productId: 1, size: null, quantity: 1 },
      { productId: 2, size: "40", quantity: 3 },
    ]);
  });

  test("clamps huge quantities and dedupes (product, size)", () => {
    const raw = JSON.stringify([
      [1, null, 1_000_000],
      [1, null, 2],
    ]);
    assert.deepEqual(parseBag(raw), [{ productId: 1, size: null, quantity: MAX_LINE_QUANTITY }]);
  });

  test(`keeps at most ${MAX_BAG_LINES} lines`, () => {
    const raw = JSON.stringify(Array.from({ length: 50 }, (_, i) => [i + 1, null, 1]));
    assert.equal(parseBag(raw).length, MAX_BAG_LINES);
  });
});

describe("input parsers", () => {
  test("parseProductId", () => {
    assert.equal(parseProductId("12"), 12);
    assert.equal(parseProductId(12), 12);
    for (const v of ["0", "-1", "1e3", "1.5", "", null, undefined, "9999999999"]) {
      assert.equal(parseProductId(v), undefined, String(v));
    }
  });

  test("parseSize: empty string and null mean one-size", () => {
    assert.equal(parseSize(""), null);
    assert.equal(parseSize(null), null);
    assert.equal(parseSize("M"), "M");
    assert.equal(parseSize("x".repeat(21)), undefined);
    assert.equal(parseSize(3), undefined);
  });

  test("parseQuantity", () => {
    assert.equal(parseQuantity("3"), 3);
    assert.equal(parseQuantity(MAX_LINE_QUANTITY), MAX_LINE_QUANTITY);
    for (const v of [0, MAX_LINE_QUANTITY + 1, -1, 1.5, "0", "abc", null]) {
      assert.equal(parseQuantity(v), undefined, String(v));
    }
  });
});

describe("line operations", () => {
  const lines: BagLine[] = [{ productId: 2, size: "39", quantity: 1 }];

  test("addLine merges the same product and size", () => {
    assert.deepEqual(addLine(lines, { productId: 2, size: "39", quantity: 1 }), [
      { productId: 2, size: "39", quantity: 2 },
    ]);
  });

  test("addLine appends a different size as a new line", () => {
    assert.equal(addLine(lines, { productId: 2, size: "40", quantity: 1 }).length, 2);
  });

  test("setLineQuantity and removeLine target one line", () => {
    const two = addLine(lines, { productId: 1, size: null, quantity: 1 });
    assert.deepEqual(setLineQuantity(two, 1, null, 3)[1], { productId: 1, size: null, quantity: 3 });
    assert.deepEqual(removeLine(two, 2, "39"), [{ productId: 1, size: null, quantity: 1 }]);
    assert.equal(bagCount(two), 2);
  });
});

describe("stock", () => {
  test("lineLimit is min(stock, MAX), 0 when sold out, undefined when missing", () => {
    assert.equal(lineLimit(bag, null), 3);
    assert.equal(lineLimit(shoe, "40"), MAX_LINE_QUANTITY);
    assert.equal(lineLimit(shoe, "38"), 0);
    assert.equal(lineLimit(shoe, "41"), undefined);
    assert.equal(lineLimit(shoe, null), undefined); // sized product needs a size
    assert.equal(lineLimit(bag, "M"), undefined); // one-size product takes no size
    assert.equal(lineLimit(undefined, null), undefined);
  });

  test("normalizeBag drops missing lines, clamps to stock, keeps sold-out lines", () => {
    const lines: BagLine[] = [
      { productId: 1, size: null, quantity: 5 },
      { productId: 2, size: "38", quantity: 2 },
      { productId: 2, size: "41", quantity: 1 },
      { productId: 99, size: null, quantity: 1 },
    ];
    assert.deepEqual(normalizeBag(lines, [bag, shoe]), [
      { productId: 1, size: null, quantity: 3 },
      { productId: 2, size: "38", quantity: 2 },
    ]);
  });
});

describe("priceBag", () => {
  test("uses current prices and integer cents", () => {
    const { items, subtotalCents, count } = priceBag(
      [
        { productId: 1, size: null, quantity: 2 },
        { productId: 2, size: "39", quantity: 1 },
      ],
      [bag, shoe],
    );
    assert.deepEqual(
      items.map((i) => [i.status, i.lineTotalCents]),
      [
        ["ok", 250_000],
        ["ok", 79_500],
      ],
    );
    assert.equal(subtotalCents, 329_500);
    assert.equal(count, 3);
    assert.ok(Number.isInteger(subtotalCents));
  });

  test("reduced, sold out and unavailable lines", () => {
    const { items, subtotalCents, count } = priceBag(
      [
        { productId: 1, size: null, quantity: 5 }, // only 3 in stock
        { productId: 2, size: "38", quantity: 1 }, // sold out
        { productId: 2, size: "41", quantity: 1 }, // size gone
        { productId: 99, size: null, quantity: 1 }, // product gone: omitted
      ],
      [bag, shoe],
    );
    assert.deepEqual(
      items.map((i) => [i.status, i.purchasableQuantity, i.maxQuantity, i.lineTotalCents]),
      [
        ["reduced", 3, 3, 375_000],
        ["sold_out", 0, 0, 0],
        ["unavailable", 0, 0, 0],
      ],
    );
    assert.equal(subtotalCents, 375_000);
    assert.equal(count, 3);
  });

  test("an empty bag", () => {
    assert.deepEqual(priceBag([], []), { items: [], subtotalCents: 0, count: 0 });
  });
});

test("bagErrorMessage", () => {
  assert.equal(bagErrorMessage({ ok: false, error: "stock", limit: 2, inBag: 0 }), "Only 2 available.");
  assert.equal(
    bagErrorMessage({ ok: false, error: "stock", limit: 2, inBag: 2 }),
    "You already have 2 in your bag, the most available.",
  );
  assert.equal(bagErrorMessage({ ok: false, error: "sold_out" }), "This item has just sold out.");
});
