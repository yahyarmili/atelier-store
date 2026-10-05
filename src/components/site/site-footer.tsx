import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

const columns = [
  {
    title: "Client Services",
    links: [
      { label: "Contact us", href: "/client-services" },
      { label: "Track an order", href: "/account/orders" },
      { label: "Shipping & returns", href: "/client-services/shipping" },
      { label: "FAQs", href: "/client-services/faq" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "About Atelier", href: "/about" },
      { label: "Craftsmanship", href: "/stories/craftsmanship" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Cookie policy", href: "/legal/cookies" },
      { label: "Terms of sale", href: "/legal/terms" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="surface-inverse">
      <div className="container-page grid-layout gap-y-12 pt-16 pb-12 lg:pt-20">
        {columns.map((col) => (
          <nav
            key={col.title}
            aria-label={col.title}
            className="col-span-2 md:col-span-2 lg:col-span-2"
          >
            <h2 className="title-xs mb-6 text-inverse-muted">{col.title}</h2>
            <ul className="space-y-4">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-quiet">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-4 md:col-span-6 md:col-start-1 lg:col-span-5 lg:col-start-8">
          <h2 className="title-xs mb-3 text-inverse-muted">Sign up for updates</h2>
          <p className="mb-2 text-inverse-muted">
            New collections, private events and stories from the workshop.
          </p>
          <NewsletterForm />

          <h2 className="title-xs mt-12 mb-3 text-inverse-muted">Country / Region</h2>
          <Link href="/country" className="link">
            United States (USD $)
          </Link>
        </div>
      </div>

      <div className="container-page overflow-hidden">
        <p
          aria-hidden="true"
          className="wordmark text-center text-[16vw] leading-none select-none [--wordmark-tracking:0.2em] lg:text-[14vw]"
        >
          Atelier
        </p>
      </div>

      <div className="container-page hairline-t flex flex-col gap-2 py-6 text-inverse-muted md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Atelier Store. All rights reserved.</p>
        <p>Sample storefront — product imagery via Unsplash.</p>
      </div>
    </footer>
  );
}
