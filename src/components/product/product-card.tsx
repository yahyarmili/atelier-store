import Image from "next/image";
import Link from "next/link";
import { formatPrice, stockState, totalStock, type Product } from "@/lib/catalog";

type Props = {
  product: Product;
  sizes?: string;
  /** Above-the-fold cards: load the image eagerly. */
  preload?: boolean;
};

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  preload = false,
}: Props) {
  const soldOut = stockState(totalStock(product)) === "sold_out";
  const badge = soldOut ? "Sold out" : product.badge;

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full bg-paper">
      <div className="media aspect-square">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className="transition-transform duration-1000 ease-luxe group-hover:scale-[1.04]"
        />
        {badge && (
          <span className="caption absolute top-3 left-3 bg-paper/90 px-1.5 py-0.5">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1 px-3 pt-3 pb-8 md:pb-10">
        <p className="text-muted">{product.category.name}</p>
        <h3 className="font-normal">{product.name}</h3>
        <p className={`price pt-1 ${soldOut ? "text-muted" : ""}`}>
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
