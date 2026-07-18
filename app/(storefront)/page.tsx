import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { BestSellers } from "@/components/home/BestSellers";
import { SignatureSection } from "@/components/home/SignatureSection";
import { WhyChooseAkram } from "@/components/home/WhyChooseAkram";
import { OurStory } from "@/components/home/OurStory";
import { Testimonials } from "@/components/home/Testimonials";
import { signatureCollectionService } from "@/services/signature-collection-service";

// ISR, matching the rest of the storefront: admin edits to the Signature section
// appear within 5 minutes even without an explicit revalidate.
export const revalidate = 300;

/**
 * Section order follows the benchmark's flow: establish the brand, reassure,
 * then route the visitor into the catalogue (category, then best sellers) before
 * any storytelling. Everything below the hero reads from the backend.
 */
export default async function Home() {
  // Authored in the admin (Signature Collection); hidden sections never arrive here.
  const signatureCollections = await signatureCollectionService.listActive();

  return (
    <>
      <Hero />
      <TrustBar />
      <ShopByCategory />
      <BestSellers />
      {signatureCollections.map((collection) => (
        <SignatureSection key={collection.id} collection={collection} />
      ))}
      <WhyChooseAkram />
      <OurStory />
      <Testimonials />
    </>
  );
}
