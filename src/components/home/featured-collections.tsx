import Image from "next/image";
import Link from "next/link";
import { featuredCollections } from "@/lib/catalog";

export function FeaturedCollections() {
  return (
    <section aria-label="Featured collections" className="grid gap-px md:grid-cols-2">
      {featuredCollections.map((collection) => (
        <Link
          key={collection.slug}
          href={`/collections/${collection.slug}`}
          className="group relative block aspect-[4/5] overflow-hidden bg-surface text-paper lg:aspect-[3/4]"
        >
          <Image
            src={collection.image.src}
            alt={collection.image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.03]"
          />
          <div className="hero-scrim" />
          <div className="absolute inset-x-0 bottom-0 px-gutter pb-10 lg:pb-14">
            <p className="title-xs mb-3">{collection.eyebrow}</p>
            <h2 className="title-l mb-2">{collection.title}</h2>
            <p className="body mb-5 max-w-sm">{collection.description}</p>
            <span className="link title-xs">Shop the collection</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
