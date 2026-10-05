import Image from "next/image";
import Link from "next/link";
import { categoryHref } from "@/lib/catalog";
import { getCategories } from "@/lib/products";

export async function CategoryRow() {
  const categories = await getCategories();

  return (
    <section aria-labelledby="categories-title" className="section">
      <div className="container-page mb-6 lg:mb-8">
        <h2 id="categories-title" className="title-m">
          Shop by Category
        </h2>
      </div>

      {/* Swipeable on small screens; five equal columns on desktop. */}
      <ul className="scroll-row scroll-px-gutter px-gutter [--row-gap:1rem] lg:[--row-gap:1.5rem]">
        {categories.map((category) => (
          <li
            key={category.slug}
            className="w-[62vw] sm:w-[40vw] md:w-[30vw] lg:w-[calc((100%-6rem)/5)]"
          >
            <Link href={categoryHref(category.slug)} className="group block">
              <div className="media mb-4 aspect-[3/4]">
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 62vw"
                  className="transition-transform duration-1000 ease-luxe group-hover:scale-[1.04]"
                />
              </div>
              <span className="title-xs link-quiet">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
