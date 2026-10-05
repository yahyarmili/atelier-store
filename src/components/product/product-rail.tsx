"use client";

import { useId, useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";

type Props = {
  title: string;
  products: Product[];
};

// Horizontally scrolling product carousel: swipe on touch, arrows on desktop.
export function ProductRail({ title, products }: Props) {
  const railRef = useRef<HTMLUListElement>(null);
  const titleId = useId();

  const scroll = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-labelledby={titleId} className="section">
      <div className="container-page mb-6 flex items-end justify-between gap-4">
        <h2 id={titleId} className="title-m">
          {title}
        </h2>
        <div className="hidden gap-1 md:flex">
          <button
            type="button"
            className="btn-icon border border-line"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            className="btn-icon border border-line"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      <ul ref={railRef} className="scroll-row [--row-gap:1px]">
        {products.map((product) => (
          <li key={product.slug} className="w-[70vw] sm:w-[45vw] md:w-[33vw] lg:w-[25vw]">
            <ProductCard
              product={product}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 70vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
