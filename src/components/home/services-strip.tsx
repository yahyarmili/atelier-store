import { services } from "@/lib/catalog";

export function ServicesStrip() {
  return (
    <section aria-label="Services" className="container-page hairline-t">
      <ul className="grid gap-x-6 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        {services.map((service) => (
          <li key={service.title} className="text-center">
            <h3 className="title-xs mb-2">{service.title}</h3>
            <p className="text-muted">{service.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
