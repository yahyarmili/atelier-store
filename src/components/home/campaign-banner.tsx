import Image from "next/image";
import Link from "next/link";
import { campaign } from "@/lib/catalog";

export function CampaignBanner() {
  return (
    <section className="hero [--hero-h:80svh] lg:[--hero-h-lg:90svh]">
      <Image
        src={campaign.image.src}
        alt={campaign.image.alt}
        fill
        sizes="100vw"
        className="object-cover object-[50%_12%]"
      />
      <div className="hero-scrim" />
      <div className="container-page relative pb-12 text-center lg:pb-20">
        <p className="title-xs mb-4">{campaign.eyebrow}</p>
        <h2 className="title-display mb-4">{campaign.title}</h2>
        <p className="body mx-auto mb-8 max-w-md">{campaign.description}</p>
        <Link
          href={campaign.cta.href}
          className="btn btn-outline-light"
        >
          {campaign.cta.label}
        </Link>
      </div>
    </section>
  );
}
