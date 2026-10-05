import Image from "next/image";
import Link from "next/link";
import { hero } from "@/lib/catalog";

export function Hero() {
  return (
    <section className="hero [--hero-h:88svh] lg:[--hero-h-lg:100svh]">
      <Image
        src={hero.image.src}
        alt={hero.image.alt}
        fill
        preload
        sizes="100vw"
        className="object-cover object-[50%_35%]"
      />
      <div className="hero-scrim" />
      <div className="container-page relative pb-12 lg:pb-20">
        <div className="max-w-2xl">
          <p className="title-xs mb-4">{hero.eyebrow}</p>
          <h1 className="title-display mb-4">{hero.title}</h1>
          <p className="body mb-8 max-w-md">{hero.description}</p>
          <Link
            href={hero.cta.href}
            className="btn btn-light"
          >
            {hero.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
