import { CampaignBanner } from "@/components/home/campaign-banner";
import { CategoryRow } from "@/components/home/category-row";
import { EditorialStory } from "@/components/home/editorial-story";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";
import { ServicesStrip } from "@/components/home/services-strip";
import { ProductRail } from "@/components/product/product-rail";
import { getMostWanted } from "@/lib/products";

// Catalog and stock come from the database; refresh the prerender every minute.
export const revalidate = 60;

export default async function Home() {
  const mostWanted = await getMostWanted();

  return (
    <>
      <Hero />
      <FeaturedCollections />
      <NewArrivals />
      <CampaignBanner />
      <CategoryRow />
      <EditorialStory />
      <ProductRail title="Most Wanted" products={mostWanted} />
      <ServicesStrip />
    </>
  );
}
