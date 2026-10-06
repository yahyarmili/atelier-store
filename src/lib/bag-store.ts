import "server-only";
import { cookies } from "next/headers";
import {
  BAG_COOKIE,
  BAG_COUNT_COOKIE,
  bagCount,
  parseBag,
  priceBag,
  serializeBag,
  type BagLine,
} from "./bag";
import { getBagProducts } from "./products";

// Reads and writes the bag cookie. Cookies can only be written from Server
// Actions / Route Handlers; Server Components may only read (`getBag`).

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const cookieOptions = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
} as const;

export async function readBag(): Promise<BagLine[]> {
  const raw = (await cookies()).get(BAG_COOKIE)?.value;
  if (!raw) return [];
  // base64url keeps the JSON free of characters that need cookie escaping.
  return parseBag(Buffer.from(raw, "base64url").toString("utf8"));
}

export async function writeBag(lines: BagLine[]) {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(BAG_COOKIE);
    store.delete(BAG_COUNT_COOKIE);
    return;
  }
  store.set(BAG_COOKIE, Buffer.from(serializeBag(lines)).toString("base64url"), {
    ...cookieOptions,
    httpOnly: true,
  });
  store.set(BAG_COUNT_COOKIE, String(bagCount(lines)), cookieOptions);
}

/** The bag priced with current catalog data. Makes the calling route dynamic. */
export async function getBag() {
  const lines = await readBag();
  return priceBag(lines, await getBagProducts(lines.map((l) => l.productId)));
}
