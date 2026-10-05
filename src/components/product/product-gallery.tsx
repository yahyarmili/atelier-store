"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Img } from "@/lib/catalog";

// Swipeable carousel with a progress bar on small screens;
// a vertical stack of full-width images on desktop.
export function ProductGallery({ images }: { images: Img[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        onScroll={onScroll}
        aria-label="Product images"
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:flex-col lg:gap-px lg:overflow-visible lg:snap-none [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => (
          <li key={image.src} className="w-full shrink-0 snap-start">
            <div className="media aspect-[4/5]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={i === 0}
                sizes="(min-width: 1024px) 58vw, 100vw"
              />
            </div>
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-gutter pb-4 lg:hidden">
          <div className="relative h-0.5 flex-1 bg-paper/60" aria-hidden="true">
            <div
              className="absolute inset-y-0 left-0 bg-ink transition-transform duration-500 ease-luxe"
              style={{
                width: `${100 / images.length}%`,
                transform: `translateX(${index * 100}%)`,
              }}
            />
          </div>
          <p className="caption bg-paper/85 px-1.5 py-0.5 tabular-nums" aria-live="polite">
            {index + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
