import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServicesStrip } from "@/components/home/services-strip";
import { ProductAccordion } from "@/components/product/product-accordion";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductRail } from "@/components/product/product-rail";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { categoryHref, formatPrice, stockState, totalStock } from "@/lib/catalog";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/lib/products";

// Products prerendered at build, refreshed every minute (stock changes).
// Products added later render on first request; unknown slugs 404.
export const revalidate = 60;

export function generateStaticParams() {
  return getProductSlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.gallery[0].src, alt: product.gallery[0].alt }],
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const availability = stockState(totalStock(product));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.reference,
    color: product.color,
    category: product.category.name,
    image: product.gallery.map((img) => img.src),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price / 100,
      availability:
        availability === "sold_out"
          ? "https://schema.org/OutOfStock"
          : availability === "low_stock"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <article className="lg:grid lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <ProductGallery images={product.gallery} />
        </div>

        <div className="px-gutter pt-6 pb-12 lg:sticky lg:top-header lg:col-span-5 lg:max-h-[calc(100svh-var(--header-height))] lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin] lg:px-12 lg:pt-10 xl:px-20">
          <nav aria-label="Breadcrumb" className="mb-8 text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="link-muted">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={categoryHref(product.category.slug)} className="link-muted">
                  {product.category.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {product.name}
              </li>
            </ol>
          </nav>

          <header className="mb-8 space-y-3">
            <Link
              href={categoryHref(product.category.slug)}
              className="title-xs link-muted inline-block"
            >
              {product.category.name}
            </Link>
            <h1 className="title-m">{product.name}</h1>
            <p className="body tabular-nums">{formatPrice(product.price)}</p>
          </header>

          <dl className="mb-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted">Colour</dt>
            <dd>{product.color}</dd>
            <dt className="text-muted">Style</dt>
            <dd className="tabular-nums">{product.reference}</dd>
          </dl>

          <PurchasePanel product={product} />

          <div className="hairline-t mt-10">
            <ProductAccordion title="Description" defaultOpen>
              <p className="body">{product.description}</p>
            </ProductAccordion>
            <ProductAccordion title="Details & care">
              <ul className="list-disc space-y-1.5 pl-4">
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </ProductAccordion>
            <ProductAccordion title="Shipping & returns">
              <p>
                Complimentary express shipping on every order, delivered in 2–4 business
                days. Returns are free within 30 days of delivery.
              </p>
            </ProductAccordion>
          </div>
        </div>
      </article>

      <ProductRail title="You May Also Like" products={related} />
      <ServicesStrip />
    </>
  );
}
