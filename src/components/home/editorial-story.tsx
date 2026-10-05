import Image from "next/image";
import Link from "next/link";
import { editorial } from "@/lib/catalog";

export function EditorialStory() {
  return (
    <section aria-labelledby="editorial-title" className="section bg-surface">
      <div className="container-page grid-layout items-center gap-y-10">
        <div className="media col-span-4 aspect-[4/5] md:col-span-4 lg:col-span-6">
          <Image
            src={editorial.image.src}
            alt={editorial.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className="col-span-4 md:col-span-4 lg:col-span-4 lg:col-start-8">
          <p className="title-xs mb-4 text-muted">{editorial.eyebrow}</p>
          <h2 id="editorial-title" className="title-l mb-6">
            {editorial.title}
          </h2>
          <div className="body mb-8 space-y-4 text-soft">
            {editorial.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link href={editorial.cta.href} className="btn btn-secondary">
            {editorial.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
