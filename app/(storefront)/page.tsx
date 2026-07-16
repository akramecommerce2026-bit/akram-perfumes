import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { SignatureSection } from "@/components/home/SignatureSection";
import { WhyChooseAkram } from "@/components/home/WhyChooseAkram";
import { Testimonials } from "@/components/home/Testimonials";
import { signatureCollectionService } from "@/services/signature-collection-service";

// ISR, matching the rest of the storefront: admin edits to the Signature section
// appear within 5 minutes even without an explicit revalidate.
export const revalidate = 300;

export default async function Home() {
  // Authored in the admin (Signature Collection); hidden sections never arrive here.
  const signatureCollections = await signatureCollectionService.listActive();

  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedCollections />
      {signatureCollections.map((collection) => (
        <SignatureSection key={collection.id} collection={collection} />
      ))}
      <WhyChooseAkram />
      <Testimonials />
    </>
  );
}
